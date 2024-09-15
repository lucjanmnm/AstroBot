const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./propozycje.db', (err) => {
  if (err) {
    console.error('Błąd podczas otwierania bazy danych:', err.message);
  }
});

db.serialize(() => {
  db.run("PRAGMA busy_timeout = 3000"); // 3000 ms = 3 sekundy
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      approved INTEGER DEFAULT 0,
      rejected INTEGER DEFAULT 0
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_votes (
      user_id TEXT,
      message_id TEXT,
      vote_type TEXT,
      PRIMARY KEY (user_id, message_id)
    )
  `);
});

module.exports = db;
