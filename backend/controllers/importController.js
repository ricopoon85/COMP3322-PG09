const noteModel = require('../models/noteModel');

const MAX_IMPORT_BYTES = 1024 * 1024;
const allowedTextTypes = new Set([
  'text/plain',
  'text/markdown',
  'application/json',
]);
const allowedImageTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const estimateBytes = (value) => Buffer.byteLength(value, 'utf8');

const importFile = async (req, res, next) => {
  try {
    const { filename, mimeType, content } = req.body || {};
    if (
      typeof filename !== 'string' ||
      !filename.trim() ||
      typeof mimeType !== 'string' ||
      typeof content !== 'string'
    ) {
      throw validationError('filename, mimeType and content are required');
    }

    const safeFilename = filename.trim().replace(/[^\w.\- ]/g, '_');
    if (estimateBytes(content) > MAX_IMPORT_BYTES) {
      throw validationError('Imported file must be at most 1 MB');
    }

    let noteContent;
    if (allowedTextTypes.has(mimeType)) {
      noteContent = content;
    } else if (allowedImageTypes.has(mimeType)) {
      if (!/^[A-Za-z0-9+/=\r\n]+$/.test(content)) {
        throw validationError('Image content must be base64 encoded');
      }
      noteContent = `![${safeFilename}](data:${mimeType};base64,${content})`;
    } else {
      throw validationError('Unsupported import file type');
    }

    const note = await noteModel.create(req.user.userId, {
      title: safeFilename.slice(0, 100),
      content: noteContent,
    });
    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    return next(error);
  }
};

module.exports = { importFile };
