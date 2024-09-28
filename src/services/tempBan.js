const { EmbedBuilder } = require('discord.js');
const db = require('../utils/warns'); 

const TEMP_BAN_DURATION = 7 * 24 * 60 * 60 * 1000; 

/**
 * @param {Client} client 
 * @param {string} userId 
 * @param {string} guildId 
 */
async function checkWarningsAndApplyTempBan(client, userId, guildId) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT COUNT(*) AS count FROM warns WHERE user_id = ? AND guild_id = ?`, [userId, guildId], async (err, rows) => {
      if (err) {
        console.error('Error fetching warnings count:', err);
        return reject(err);
      }
      
      const warningCount = rows[0].count;
      console.log(`Warning count for user ${userId}: ${warningCount}`);
      
      if (warningCount >= 5) {
        const unbanTime = Date.now() + TEMP_BAN_DURATION;
        
        db.run(`INSERT OR REPLACE INTO temp_bans (user_id, guild_id, unban_time) VALUES (?, ?, ?)`, [userId, guildId, unbanTime], async (err) => {
          if (err) {
            console.error('Error applying temporary ban:', err);
            return reject(err);
          }

          const guild = client.guilds.cache.get(guildId);
          if (!guild) {
            console.error('Guild not found.');
            return resolve();
          }

          const member = guild.members.cache.get(userId);
          if (!member) {
            console.error('Member not found.');
            return resolve();
          }

          try {
            const dmEmbed = new EmbedBuilder()
              .setColor('Red')
              .setDescription(`❌ Zostałeś tymczasowo zbanowany na serwerze: ${guild.name}. Powód: 5 ostrzeżeń na czas: 7 dni`);
            await member.send({ embeds: [dmEmbed] }).catch(err => {
              console.error('Failed to send DM to the banned user:', err);
            });

            await member.ban({ reason: '5 ostrzeżeń - tempban' });

            const embed = new EmbedBuilder()
              .setTitle('Temporary Ban')
              .setDescription(`<@${userId}> został(a) tymczasowo zbanowany(a) na 7 dni z powodu 5 ostrzeżeń.`)
              .setColor('#FF0000')
              .setTimestamp();

            const logChannel = guild.channels.cache.get('1284195111726485568'); 
            if (logChannel) {
              logChannel.send({ embeds: [embed] });
            } else {
              console.error('Log channel not found.');
            }

            db.run(`DELETE FROM warns WHERE user_id = ? AND guild_id = ?`, [userId, guildId], (err) => {
              if (err) {
                console.error('Error removing warnings:', err);
              }
            });

            db.run(`INSERT INTO warns (user_id, guild_id, reason, timestamp) VALUES (?, ?, ?, ?)`, [userId, guildId, '5 ostrzeżeń - tempban', Date.now()], (err) => {
              if (err) {
                console.error('Error adding new warning:', err);
              }
            });

            setTimeout(async () => {
              try {
                await guild.members.unban(userId, 'Temp ban skonczył się.');
              } catch (err) {
                console.error('Error unbanning user:', err.message);
              }

              db.run(`DELETE FROM temp_bans WHERE user_id = ? AND guild_id = ?`, [userId, guildId], (err) => {
                if (err) {
                  console.error('Error deleting temporary ban from database:', err.message);
                }
              });
            }, TEMP_BAN_DURATION);

          } catch (error) {
            console.error('Error banning the user: ', error);
            return reject(error);
          }

          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

module.exports = { checkWarningsAndApplyTempBan };
