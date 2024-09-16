const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/warns'); 
const { checkWarningsAndApplyTempBan } = require('./tempBan');

const ANTI_LINK_TIMEOUT = 15 * 60 * 1000; 

async function antiLink(message) {
  const linkRegex = /discord(?:app\.com\/invite|\.gg)\/[a-zA-Z0-9]{2,}/i;
  
  if (linkRegex.test(message.content)) {
    // Apply warning and timeout
    const userId = message.author.id;
    const guildId = message.guild.id;

    // Add warning to the database
    db.run(`INSERT INTO warns (user_id, guild_id, reason) VALUES (?, ?, ?)`, [userId, guildId, 'Link do Discorda'], async (err) => {
      if (err) console.error('Błąd podczas zapisywania warnu:', err);


      await checkWarningsAndApplyTempBan(userId, guildId);
    });

    // Apply timeout
    const member = message.guild.members.cache.get(userId);
    if (member) {
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            message.delete().catch(() => {});
        } else {
        try {
                await member.timeout(ANTI_LINK_TIMEOUT, 'Link do Discorda');
            } catch (error) {
                console.error('Error applying timeout:', error);
            }
        }
    }

    const embed = new EmbedBuilder()
      .setTitle('Anty-Link')
      .setDescription(`**Użytkownik:** <@${userId}>\nWysłał link do Discorda, co jest zabronione i został wyciszony!`)
      .setColor('#FF0000')
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    message.delete().catch(() => {});
  }
}

module.exports = { antiLink };
