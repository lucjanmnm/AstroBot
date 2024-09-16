const { EmbedBuilder } = require('discord.js');
const db = require('../utils/warns'); // Adjust the path if needed

const TEMP_BAN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Check warnings and apply a temporary ban if needed.
 * @param {Client} client - The Discord client.
 * @param {string} userId - The ID of the user to check.
 * @param {string} guildId - The ID of the guild.
 */
async function checkWarningsAndApplyTempBan(client, userId, guildId) {
  return new Promise((resolve, reject) => {
    // Get the count of warnings for the user
    db.all(`SELECT COUNT(*) AS count FROM warns WHERE user_id = ? AND guild_id = ?`, [userId, guildId], async (err, rows) => {
      if (err) {
        console.error('Error fetching warnings count:', err);
        return reject(err);
      }
      
      const warningCount = rows[0].count;
      
      if (warningCount >= 5) {
        // Apply temporary ban
        const unbanTime = Date.now() + TEMP_BAN_DURATION;
        
        db.run(`INSERT OR REPLACE INTO temp_bans (user_id, guild_id, unban_time) VALUES (?, ?, ?)`, [userId, guildId, unbanTime], async (err) => {
          if (err) {
            console.error('Error applying temporary ban:', err);
            return reject(err);
          }

          // Get the guild and member
          const guild = client.guilds.cache.get(guildId);
          if (!guild) {
            console.error('Guild not found.');
            return resolve(); // Proceed even if the guild is not found
          }

          const member = guild.members.cache.get(userId);
          if (!member) {
            console.error('Member not found.');
            return resolve(); // Proceed even if the member is not found
          }

          try {
            await member.timeout(TEMP_BAN_DURATION, '5 warnings');
            console.log(`Applied temporary ban to ${userId} for 7 days due to 5 warnings.`);
            
            // Send embed message
            const embed = new EmbedBuilder()
              .setTitle('Temporary Ban')
              .setDescription(`<@${userId}> został(a) tymczasowo zbanowany(a) na 7 dni z powodu 5 ostrzeżeń.`)
              .setColor('#FF0000')
              .setTimestamp();

            const logChannel = guild.channels.cache.get('1284195111726485568'); // Replace with your log channel ID
            if (logChannel) {
              logChannel.send({ embeds: [embed] });
            } else {
              console.error('Log channel not found.');
            }

          } catch (error) {
            console.error('Error applying timeout:', error);
            return reject(error);
          }

          resolve();
        });
      } else {
        resolve(); // No action needed if warning count is less than 5
      }
    });
  });
}

module.exports = { checkWarningsAndApplyTempBan };
