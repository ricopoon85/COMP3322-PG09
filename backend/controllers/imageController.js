const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const imageModel = require('../models/imageModel');
const noteModel = require('../models/noteModel');
const shareModel = require('../models/shareModel');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);
const storageDirectory = path.resolve(
  process.env.IMAGE_STORAGE_DIR || path.join(__dirname, '..', 'uploads')
);

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseId = (value, label) => {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    throw validationError(`Invalid ${label}`);
  }
  return Number(value);
};

const safeOriginalName = (value) => {
  const name = path.basename(value).replace(/[^\w.\- ]/g, '_').trim();
  return name.slice(0, 255) || 'image';
};

const imageUrl = (id) => `/api/images/${id}`;

const uploadImage = async (req, res, next) => {
  let storageKey;
  try {
    const noteId = parseId(req.params.id, 'note id');
    const note = await noteModel.findById(req.user.userId, noteId);
    if (!note) {
      const share = await shareModel.findByRecipient(noteId, req.user.userId);
      if (share?.permission !== 'edit') {
        if (share) {
          const error = new Error('Edit permission required');
          error.statusCode = 403;
          throw error;
        }
        const error = new Error('Note not found');
        error.statusCode = 404;
        throw error;
      }
    }
    const { filename, mimeType, content } = req.body || {};
    if (
      typeof filename !== 'string' ||
      typeof mimeType !== 'string' ||
      typeof content !== 'string' ||
      !filename.trim() ||
      !content
    ) {
      throw validationError('filename, mimeType and content are required');
    }
    if (!allowedTypes.has(mimeType)) {
      throw validationError('Unsupported image type');
    }
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(content) || content.length % 4 !== 0) {
      throw validationError('Image content must be base64 encoded');
    }
    const buffer = Buffer.from(content, 'base64');
    if (buffer.length > MAX_IMAGE_BYTES) {
      throw validationError('Image must be at most 5 MB');
    }

    storageKey = `${crypto.randomUUID()}${path.extname(filename).toLowerCase()}`;
    await fs.mkdir(storageDirectory, { recursive: true });
    await fs.writeFile(path.join(storageDirectory, storageKey), buffer, { flag: 'wx' });

    const image = await imageModel.create({
      noteId,
      storageKey,
      originalName: safeOriginalName(filename),
      mimeType,
      byteSize: buffer.length,
    });
    return res.status(201).json({
      success: true,
      data: { ...image, url: imageUrl(image.id) },
    });
  } catch (error) {
    if (storageKey) {
      await fs.unlink(path.join(storageDirectory, storageKey)).catch(() => {});
    }
    return next(error);
  }
};

const getImage = async (req, res, next) => {
  try {
    const imageId = parseId(req.params.id, 'image id');
    const image = await imageModel.findAccessibleById(req.user.userId, imageId);
    if (!image) return res.status(404).json({ success: false, error: 'Image not found' });

    const file = await fs.readFile(path.join(storageDirectory, image.storage_key));
    res.set('Content-Type', image.mime_type);
    res.set('Content-Length', String(file.length));
    res.set('Cache-Control', 'private, max-age=3600');
    return res.status(200).send(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      error.statusCode = 404;
      error.message = 'Image file not found';
    }
    return next(error);
  }
};

module.exports = { uploadImage, getImage, storageDirectory, MAX_IMAGE_BYTES };
