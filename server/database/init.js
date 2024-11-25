const db = require('../config/database');

db.serialize(() => {
  db.run(`PRAGMA timezone = 'Asia/Seoul';`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS diaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      input_text TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}); 