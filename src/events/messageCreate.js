const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client } = require('discord.js');
const db = require('../utils/database');
const { antiLink } = require('../services/antiLink');
const { antiSwearing } = require('../services/antiSwear');

module.exports = {
  name: 'messageCreate',
  /**
   *
   * @param {Client} client
   * @param {Message} message
   */
  async execute(client, message) {
    await antiSwearing(client, message);
    await antiLink(client, message);

    const PROPOSAL_CHANNEL_ID = '1284195111726485569'; 

    if (message.channel.id === PROPOSAL_CHANNEL_ID && message.content.trim()) {
      try {
        const guild = await client.guilds.fetch('1284195110237769801'); 
        const proposalEmbed = new EmbedBuilder()
          .setTitle(`Propozycja || ZygzakCode.pl`)
          .setDescription(`> **Autor Propozycji:**\n> <@${message.author.id}>\n\n> **Treść Propozycji:**\n> ` + '`' + `${message.content}` + '`')
          .setThumbnail(guild.iconURL({ size: 1024 }))
          .setTimestamp()
          .setFooter({ text: `© 2024 • ZygzakCode` })
          .setColor('#00FF00');

        const actionRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`approve_${message.id}`)
              .setLabel('✅ 0% [0]')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`reject_${message.id}`)
              .setLabel('❌ 0% [0]')
              .setStyle(ButtonStyle.Danger)
          );

        const sentMessage = await message.channel.send({
          embeds: [proposalEmbed],
          components: [actionRow],
        });

        const thread = await sentMessage.startThread({
          name: `Propozycja od ${message.author.username}`,
          autoArchiveDuration: 1440, 
        });

        db.run(`
          INSERT INTO votes (id, user, suggestion, approved, rejected)
          VALUES (?, ?, ?, 0, 0)
        `, [message.id, message.author.id, message.content], (err) => {
          if (err) console.error('Błąd podczas zapisywania propozycji:', err);
        });

        message.delete().catch(() => {});
      } catch (error) {
        console.error('Error handling message create:', error);
      }
    }
  },
};
