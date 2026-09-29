const db = require('../config/db');

const noteFields = 'id, user_id, title, content, created_at, updated_at';

const noteModel = {
  async listByUser(userId, search = '') {
    let sql = `SELECT ${noteFields} FROM notes WHERE user_id = ?`;
    const params = [userId];

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY updated_at DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async findById(userId, noteId) {
    const sql = `SELECT ${noteFields} FROM notes WHERE id = ? AND user_id = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [noteId, userId]);
    return rows[0];
  },

  async create(userId, { title = null, content = null }) {
    const sql = 'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [userId, title, content]);
    return noteModel.findById(userId, result.insertId);
  },

  async update(userId, noteId, { title, content }) {
    const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?';
    await db.execute(sql, [title, content, noteId, userId]);
    return noteModel.findById(userId, noteId);
  },

  async delete(userId, noteId) {
    const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    const [result] = await db.execute(sql, [noteId, userId]);
    return result.affectedRows > 0;
  },
};

module.exports = noteModel;
