const db = require('./db');

async function ensureBetaSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS note_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      note_id INT NOT NULL,
      owner_id INT NOT NULL,
      shared_with_user_id INT NOT NULL,
      permission ENUM('view', 'edit') NOT NULL DEFAULT 'view',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_note_recipient (note_id, shared_with_user_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

module.exports = ensureBetaSchema;
