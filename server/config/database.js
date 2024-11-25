const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('데이터베이스 연결 에러:', err);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

module.exports = db; 