const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  name: 'messageCreate',
  /**
   *
   * @param {Client} client
   * @param {Message} message
   */
  async execute(client, message) {
    const PROPOSAL_CHANNEL_ID = '1284195111726485569'; // Replace with your channel ID
    
    if (message.channel.id === PROPOSAL_CHANNEL_ID && message.content.trim()) {
      try {
        // Create the embed
        const guild = await client.guilds.fetch('1284195110237769801'); 
        const proposalEmbed = new EmbedBuilder()
          .setTitle(`Propozycja || AstroBot`)
          .setDescription(`> **Autor Propozycji:**\n> <@${message.author.id}>\n\n> **Treść Propozycji:**\n> ` + '`' + `${message.content}` + '`')
          .setThumbnail(guild.iconURL({ size: 1024 }))
          .setTimestamp()
          .setColor('#00FF00'); // Green color for the embed

        // Create buttons
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

        // Send the embed
        await message.channel.send({
          embeds: [proposalEmbed],
          components: [actionRow],
        });

        // Store the suggestion in the database
        db.run(`
          INSERT INTO votes (id, user, suggestion, approved, rejected)
          VALUES (?, ?, ?, 0, 0)
        `, [message.id, message.author.id, message.content], (err) => {
          if (err) console.error('Błąd podczas zapisywania propozycji:', err);
        });

        // Delete the original message
        message.delete().catch(() => {});
      } catch (error) {
        console.error('Error handling message create:', error);
      }
    }
  },
};
