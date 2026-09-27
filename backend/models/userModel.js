const db = require('../config/db');

const User = {
  create: async (username, email, passwordHash) => {
    const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [username, email, passwordHash]);
    return result.insertId;
  },
  findByEmail: async (email) => {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },
  findById: async (id) => {
    const sql = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
};

module.exports = User;