const shareModel = require('../models/shareModel');
const userModel = require('../models/userModel');
const noteModel = require('../models/noteModel');

const permissionValues = new Set(['view', 'edit']);

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

const getPermission = (value) => {
  if (!permissionValues.has(value)) {
    throw validationError('Permission must be view or edit');
  }
  return value;
};

const requireOwnerNote = async (userId, noteId) => {
  const note = await noteModel.findById(userId, noteId);
  if (!note) {
    const error = new Error('Note not found');
    error.statusCode = 404;
    throw error;
  }
};

const listShares = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    await requireOwnerNote(req.user.userId, noteId);
    const shares = await shareModel.listForNote(req.user.userId, noteId);
    return res.status(200).json({ success: true, data: shares });
  } catch (error) {
    return next(error);
  }
};

const createShare = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    await requireOwnerNote(req.user.userId, noteId);

    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw validationError('A valid recipient email is required');
    }
    const permission = getPermission(req.body?.permission || 'view');
    const recipient = await userModel.findUserByEmail(email);

    if (!recipient) {
      const error = new Error('Recipient user not found');
      error.statusCode = 404;
      throw error;
    }
    if (recipient.id === req.user.userId) {
      throw validationError('You cannot share a note with yourself');
    }

    const existing = await shareModel.listForNote(req.user.userId, noteId);
    if (existing.some((share) => share.shared_with_user_id === recipient.id)) {
      const error = new Error('Note is already shared with this user');
      error.statusCode = 409;
      throw error;
    }

    const share = await shareModel.create(
      req.user.userId,
      noteId,
      recipient.id,
      permission
    );
    return res.status(201).json({ success: true, data: share });
  } catch (error) {
    return next(error);
  }
};

const updateShare = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    const shareId = parseId(req.params.shareId, 'share id');
    await requireOwnerNote(req.user.userId, noteId);
    const permission = getPermission(req.body?.permission);
    const share = await shareModel.update(
      req.user.userId,
      noteId,
      shareId,
      permission
    );
    if (!share) {
      const error = new Error('Share not found');
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: share });
  } catch (error) {
    return next(error);
  }
};

const deleteShare = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    const shareId = parseId(req.params.shareId, 'share id');
    await requireOwnerNote(req.user.userId, noteId);
    const removed = await shareModel.remove(req.user.userId, noteId, shareId);
    if (!removed) {
      const error = new Error('Share not found');
      error.statusCode = 404;
      throw error;
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const listSharedNotes = async (req, res, next) => {
  try {
    const notes = await shareModel.listForRecipient(req.user.userId);
    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    return next(error);
  }
};

const getSharedNote = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    const share = await shareModel.findByRecipient(noteId, req.user.userId);
    if (!share) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    return res.status(200).json({ success: true, data: share });
  } catch (error) {
    return next(error);
  }
};

const updateSharedNote = async (req, res, next) => {
  try {
    const noteId = parseId(req.params.id, 'note id');
    const share = await shareModel.findByRecipient(noteId, req.user.userId);
    if (!share) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    if (share.permission !== 'edit') {
      return res.status(403).json({ success: false, error: 'Edit permission required' });
    }

    const fields = req.body || {};
    const allowedFields = ['title', 'content'];
    if (
      typeof fields !== 'object' ||
      Array.isArray(fields) ||
      Object.keys(fields).length === 0 ||
      Object.keys(fields).some((field) => !allowedFields.includes(field))
    ) {
      throw validationError('Only title and content are allowed');
    }
    if (
      (fields.title !== undefined &&
        (typeof fields.title !== 'string' || fields.title.length > 100)) ||
      (fields.content !== undefined &&
        (typeof fields.content !== 'string' || fields.content.length > 65535))
    ) {
      throw validationError('Invalid note content');
    }

    const current = await noteModel.findById(share.owner_id, noteId);
    const updated = await noteModel.update(share.owner_id, noteId, {
      title: fields.title === undefined ? current.title : fields.title,
      content: fields.content === undefined ? current.content : fields.content,
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listShares,
  createShare,
  updateShare,
  deleteShare,
  listSharedNotes,
  getSharedNote,
  updateSharedNote,
};
