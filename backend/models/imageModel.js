const db = require('../config/db');

const imageFields = 'note_images.id, note_images.note_id, note_images.storage_key, note_images.original_name, note_images.mime_type, note_images.byte_size, note_images.created_at';

const imageModel = {
  async create({ noteId, storageKey, originalName, mimeType, byteSize }) {
    const [result] = await db.execute(
      `INSERT INTO note_images
        (note_id, storage_key, original_name, mime_type, byte_size)
       VALUES (?, ?, ?, ?, ?)`,
      [noteId, storageKey, originalName, mimeType, byteSize]
    );
    const [rows] = await db.execute(
      `SELECT ${imageFields} FROM note_images WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    return rows[0];
  },

  async findAccessibleById(userId, imageId) {
    const [rows] = await db.execute(
      `SELECT ${imageFields}
       FROM note_images
       JOIN notes ON notes.id = note_images.note_id
       LEFT JOIN note_shares
         ON note_shares.note_id = notes.id
        AND note_shares.shared_with_user_id = ?
       WHERE note_images.id = ?
         AND (notes.user_id = ? OR note_shares.id IS NOT NULL)
       LIMIT 1`,
      [userId, imageId, userId]
    );
    return rows[0];
  },

  async findEditableById(userId, imageId) {
    const [rows] = await db.execute(
      `SELECT ${imageFields}
       FROM note_images
       JOIN notes ON notes.id = note_images.note_id
       LEFT JOIN note_shares
         ON note_shares.note_id = notes.id
        AND note_shares.shared_with_user_id = ?
        AND note_shares.permission = 'edit'
       WHERE note_images.id = ?
         AND (notes.user_id = ? OR note_shares.id IS NOT NULL)
       LIMIT 1`,
      [userId, imageId, userId]
    );
    return rows[0];
  },

  async remove(imageId) {
    const [result] = await db.execute(
      'DELETE FROM note_images WHERE id = ?',
      [imageId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = imageModel;
