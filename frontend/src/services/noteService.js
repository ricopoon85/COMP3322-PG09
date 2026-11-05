import api from './api';

const listNotes = async (search = '') => {
  const response = await api.get('/notes', {
    params: search.trim() ? { search: search.trim() } : undefined,
  });
  return response.data.data;
};

const createNote = async (fields = {}) => {
  const response = await api.post('/notes', fields);
  return response.data.data;
};

const updateNote = async (id, fields) => {
  const response = await api.patch(`/notes/${id}`, fields);
  return response.data.data;
};

const deleteNote = async (id) => {
  await api.delete(`/notes/${id}`);
};

const importNote = async ({ filename, mimeType, content }) => {
  const response = await api.post('/notes/import', {
    filename,
    mimeType,
    content,
  });
  return response.data.data;
};

const uploadImage = async (noteId, { filename, mimeType, content }) => {
  const response = await api.post(`/notes/${noteId}/images`, {
    filename,
    mimeType,
    content,
  });
  return response.data.data;
};

const fetchImage = async (imageId) => {
  const response = await api.get(`/images/${imageId}`, {
    responseType: 'blob',
  });
  return response.data;
};

const deleteImage = async (imageId) => {
  await api.delete(`/images/${imageId}`);
};

const listSharedNotes = async () => {
  const response = await api.get('/shared-notes');
  return response.data.data.map((note) => ({
    ...note,
    clientId: `shared-${note.id}`,
    shared: true,
    canEdit: note.permission === 'edit',
  }));
};

const updateSharedNote = async (id, fields) => {
  const response = await api.patch(`/shared-notes/${id}`, fields);
  return {
    ...response.data.data,
    clientId: `shared-${response.data.data.id}`,
    shared: true,
  };
};

const createShare = async (noteId, email, permission = 'view') => {
  const response = await api.post(`/notes/${noteId}/shares`, { email, permission });
  return response.data.data;
};

const listShares = async (noteId) => {
  const response = await api.get(`/notes/${noteId}/shares`);
  return response.data.data;
};

const updateShare = async (noteId, shareId, permission) => {
  const response = await api.patch(`/notes/${noteId}/shares/${shareId}`, { permission });
  return response.data.data;
};

const deleteShare = async (noteId, shareId) => {
  await api.delete(`/notes/${noteId}/shares/${shareId}`);
};

const searchNotes = (search) => listNotes(search);

export default {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  importNote,
  uploadImage,
  fetchImage,
  deleteImage,
  listSharedNotes,
  updateSharedNote,
  createShare,
  listShares,
  updateShare,
  deleteShare,
  searchNotes,
};
