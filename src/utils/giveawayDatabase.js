const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/utils/giveaways.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      winners INTEGER,
      endTime INTEGER,
      messageId TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giveawayId INTEGER,
      participant TEXT,
      FOREIGN KEY (giveawayId) REFERENCES giveaways(id)
    )
  `);
});

module.exports = {
  addGiveaway(name, description, winners, endTime, messageId) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO giveaways (name, description, winners, endTime, messageId) VALUES (?, ?, ?, ?, ?)`,
        [name, description, winners, endTime, messageId],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  getGiveawayByMessageId(messageId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM giveaways WHERE messageId = ?`, [messageId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  deleteGiveaway(name) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM giveaways WHERE name = ?`, [name], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  addParticipant(giveawayId, participant) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO participants (giveawayId, participant) VALUES (?, ?)`,
        [giveawayId, participant],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  },

  removeParticipant(giveawayId, participant) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM participants WHERE giveawayId = ? AND participant = ?`,
        [giveawayId, participant],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  },

  getParticipants(giveawayId) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT participant FROM participants WHERE giveawayId = ?`, [giveawayId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => row.participant));
      });
    });
  },

  getAllGiveaways() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM giveaways`, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};
