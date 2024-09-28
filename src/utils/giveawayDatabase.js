const sqlite3 = require('sqlite3').verbose();
const dbg = new sqlite3.Database('./src/utils/giveaways.db');

dbg.serialize(() => {
  dbg.run(`CREATE TABLE IF NOT EXISTS giveaways (
    name TEXT PRIMARY KEY,
    description TEXT,
    winners INTEGER,
    endTime INTEGER,
    participants TEXT
  )`);

  dbg.run(`CREATE TABLE IF NOT EXISTS participants (
    giveawayName TEXT,
    username TEXT,
    PRIMARY KEY (giveawayName, username),
    FOREIGN KEY (giveawayName) REFERENCES giveaways(name) ON DELETE CASCADE
  )`);
});

module.exports = {
  addGiveaway(name, description, winners, endTime) {
    return new Promise((resolve, reject) => {
      dbg.run(`INSERT INTO giveaways (name, description, winners, endTime, participants) VALUES (?, ?, ?, ?, ?)`,
        [name, description, winners, endTime, ''],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  getGiveaway(name) {
    return new Promise((resolve, reject) => {
      dbg.get(`SELECT * FROM giveaways WHERE name = ?`, [name], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },

  updateGiveaway(oldName, newName, description, winners, endTime) {
    return new Promise((resolve, reject) => {
      dbg.run(`UPDATE giveaways SET name = ?, description = ?, winners = ?, endTime = ? WHERE name = ?`,
        [newName, description, winners, endTime, oldName],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  deleteGiveaway(name) {
    return new Promise((resolve, reject) => {
      dbg.run(`DELETE FROM giveaways WHERE name = ?`, [name], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  },

  addParticipant(giveawayName, username) {
    return new Promise((resolve, reject) => {
      dbg.run(`INSERT INTO participants (giveawayName, username) VALUES (?, ?)`,
        [giveawayName, username],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  removeParticipant(giveawayName, username) {
    return new Promise((resolve, reject) => {
      dbg.run(`DELETE FROM participants WHERE giveawayName = ? AND username = ?`,
        [giveawayName, username],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  getParticipants(giveawayName) {
    return new Promise((resolve, reject) => {
      dbg.all(`SELECT username FROM participants WHERE giveawayName = ?`, [giveawayName], (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.username));
      });
    });
  }
};
