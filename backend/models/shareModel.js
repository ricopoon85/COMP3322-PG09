const db = require('../config/db');

const shareFields = `
  ns.id,
  ns.note_id,
  ns.owner_id,
  ns.shared_with_user_id,
  ns.permission,
  ns.created_at,
  ns.updated_at,
  u.username AS shared_with_username,
  u.email AS shared_with_email
`;

const shareModel = {
  async listForNote(ownerId, noteId) {
    const sql = `
      SELECT ${shareFields}
      FROM note_shares ns
      JOIN users u ON u.id = ns.shared_with_user_id
      WHERE ns.owner_id = ? AND ns.note_id = ?
      ORDER BY ns.created_at ASC
    `;
    const [rows] = await db.execute(sql, [ownerId, noteId]);
    return rows;
  },

  async findById(ownerId, noteId, shareId) {
    const sql = `
      SELECT ${shareFields}
      FROM note_shares ns
      JOIN users u ON u.id = ns.shared_with_user_id
      WHERE ns.owner_id = ? AND ns.note_id = ? AND ns.id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [ownerId, noteId, shareId]);
    return rows[0];
  },

  async findByRecipient(noteId, userId) {
    const sql = `
      SELECT ${shareFields}, n.title, n.content, n.created_at AS note_created_at,
             n.updated_at AS note_updated_at
      FROM note_shares ns
      JOIN users u ON u.id = ns.shared_with_user_id
      JOIN notes n ON n.id = ns.note_id
      WHERE ns.note_id = ? AND ns.shared_with_user_id = ?
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [noteId, userId]);
    return rows[0];
  },

  async create(ownerId, noteId, recipientId, permission) {
    const sql = `
      INSERT INTO note_shares
        (note_id, owner_id, shared_with_user_id, permission)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      noteId,
      ownerId,
      recipientId,
      permission,
    ]);
    return shareModel.findById(ownerId, noteId, result.insertId);
  },

  async update(ownerId, noteId, shareId, permission) {
    const sql = `
      UPDATE note_shares
      SET permission = ?
      WHERE id = ? AND owner_id = ? AND note_id = ?
    `;
    const [result] = await db.execute(sql, [
      permission,
      shareId,
      ownerId,
      noteId,
    ]);
    if (!result.affectedRows) return null;
    return shareModel.findById(ownerId, noteId, shareId);
  },

  async remove(ownerId, noteId, shareId) {
    const sql = `
      DELETE FROM note_shares
      WHERE id = ? AND owner_id = ? AND note_id = ?
    `;
    const [result] = await db.execute(sql, [shareId, ownerId, noteId]);
    return result.affectedRows > 0;
  },

  async listForRecipient(userId) {
    const sql = `
      SELECT n.id, n.user_id, n.title, n.content, n.created_at, n.updated_at,
             ns.id AS share_id, ns.permission, ns.owner_id,
             u.username AS owner_username, u.email AS owner_email
      FROM note_shares ns
      JOIN notes n ON n.id = ns.note_id
      JOIN users u ON u.id = ns.owner_id
      WHERE ns.shared_with_user_id = ?
      ORDER BY n.updated_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  },
};

module.exports = shareModel;
