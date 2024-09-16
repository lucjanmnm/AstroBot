const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./warns.db', (err) => {
  if (err) {
    console.error('Błąd podczas otwierania bazy danych:', err.message);
  }
});

db.serialize(() => {
  db.run("PRAGMA busy_timeout = 3000");
  
  db.run(`CREATE TABLE IF NOT EXISTS warns (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY (user_id, guild_id, timestamp)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS temp_bans (
    user_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    unban_time INTEGER NOT NULL
  )`);
});

module.exports = db;
