const noteModel = require('../models/noteModel');

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 65535;
const allowedFields = new Set(['title', 'content']);

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateId = (value) => {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    throw validationError('Invalid note id');
  }
  return Number(value);
};

const validateNoteBody = (body, { partial = false } = {}) => {
  if (body === undefined && !partial) {
    return {};
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError('Request body must be an object');
  }

  const fields = Object.keys(body);
  if (fields.some((field) => !allowedFields.has(field))) {
    throw validationError('Only title and content are allowed');
  }
  if (partial && fields.length === 0) {
    throw validationError('At least one field is required');
  }

  for (const field of fields) {
    if (body[field] !== null && typeof body[field] !== 'string') {
      throw validationError(`${field} must be a string or null`);
    }
    if (field === 'title' && body[field] !== null && body[field].length > MAX_TITLE_LENGTH) {
      throw validationError('Title must be at most 100 characters');
    }
    if (field === 'content' && body[field] !== null && body[field].length > MAX_CONTENT_LENGTH) {
      throw validationError('Content is too long');
    }
  }

  return body;
};

const getSearch = (value) => {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > MAX_CONTENT_LENGTH) {
    throw validationError('Invalid search query');
  }
  return value.trim();
};

const listNotes = async (req, res, next) => {
  try {
    const notes = await noteModel.listByUser(req.user.userId, getSearch(req.query.search));
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

const getNote = async (req, res, next) => {
  try {
    const note = await noteModel.findById(req.user.userId, validateId(req.params.id));
    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const body = validateNoteBody(req.body);
    const note = await noteModel.create(req.user.userId, body);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const noteId = validateId(req.params.id);
    const body = validateNoteBody(req.body, { partial: true });
    const current = await noteModel.findById(req.user.userId, noteId);
    if (!current) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    const note = await noteModel.update(req.user.userId, noteId, {
      title: Object.prototype.hasOwnProperty.call(body, 'title') ? body.title : current.title,
      content: Object.prototype.hasOwnProperty.call(body, 'content') ? body.content : current.content,
    });
    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const deleted = await noteModel.delete(req.user.userId, validateId(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
};
