const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/warns');
const { checkWarningsAndApplyTempBan } = require('./tempBan');

const ANTI_SWEAR_TIMEOUT = 15 * 60 * 1000; 
const SWEARING_WORDS = ['kurwa', 'zjeb', 'spiedalaj', 'kutasie', 'cwelu', 'kurwo', 'kurw@', 'zj3b', 'spi3rdalaj', 'cw3lu', 'pedal', 'p3dal', 'kastarcie', 'kastr@t', 'kurewko', 'kur3wko', 'kastrat', 'kuewa'];

async function antiSwearing(client, message) {
  const lowerCaseContent = message.content.toLowerCase();
  const containsSwearWord = SWEARING_WORDS.some(swearWord => lowerCaseContent.includes(swearWord));

  if (containsSwearWord) {
    // Apply warning and timeout
    const userId = message.author.id;
    const guildId = message.guild.id;

    // Add warning to the database
    db.run(`INSERT INTO warns (user_id, guild_id, reason, timestamp) VALUES (?, ?, ?, ?)`, [userId, guildId, 'Przeklinanie', Date.now()], async (err) => {
      if (err) {
        console.error('Błąd podczas zapisywania warnu:', err);
      } else {
        await checkWarningsAndApplyTempBan(client, userId, guildId);
      }
    });

    // Apply timeout
    const member = message.guild.members.cache.get(userId);
    if (member) {
      if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        message.delete().catch(() => {});
      } else {
        try {
          await member.timeout(ANTI_SWEAR_TIMEOUT, 'Przeklinanie');
        } catch (error) {
          console.error('Error applying timeout:', error);
        }
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('Anty-Wulgaryzm')
      .setDescription(`**Użytkownik:** <@${userId}>\nUżył wulgaryzmów, co jest zabronione i został wyciszony!`)
      .setColor('#FF0000')
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    message.delete().catch(() => {});
  }
}

module.exports = { antiSwearing };
