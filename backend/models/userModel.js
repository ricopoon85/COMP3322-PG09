const db = require('../config/db');

const User = {
  createUser: async (username, email, passwordHash) => {
    const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [username, email, passwordHash]);
    return result.insertId;
  },
  findUserByEmail: async (email) => {
    const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },
  findUserById: async (id) => {
    const sql = `SELECT id, username, email, created_at FROM users WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  },
  create: async (username, email, passwordHash) => {
    return User.createUser(username, email, passwordHash);
  },
  findByEmail: async (email) => {
    return User.findUserByEmail(email);
  },
  findById: async (id) => {
    return User.findUserById(id);
  },
};

module.exports = User;