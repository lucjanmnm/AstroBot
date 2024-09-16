const db = require('./database');

const checkTempBans = async (client) => {
    db.all(`SELECT * FROM temp_bans`, async (err, rows) => {
      if (err) {
        console.error('Error retrieving temporary bans from database:', err.message);
        return;
      }
  
      const now = Date.now();
      for (const row of rows) {
        if (now >= row.unban_time) {
          try {
            const guild = await client.guilds.fetch(row.guild_id);
            await guild.members.unban(row.user_id, 'Temporary ban expired');
            console.log(`User with ID ${row.user_id} has been unbanned.`);
  
            db.run(`DELETE FROM temp_bans WHERE user_id = ? AND guild_id = ?`, [row.user_id, row.guild_id], (err) => {
              if (err) {
                console.error('Error deleting temporary ban from database:', err.message);
              }
            });
          } catch (err) {
            console.error('Error unbanning user:', err.message);
          }
        }
      }
    });
  };
  
module.exports = checkTempBans; 