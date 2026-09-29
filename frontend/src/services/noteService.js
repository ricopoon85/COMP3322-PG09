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

const searchNotes = (search) => listNotes(search);

export default {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
};
