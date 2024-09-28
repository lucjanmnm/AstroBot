const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Pokazuje ostrzeżenia użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik, którego ostrzeżenia chcesz zobaczyć')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');

    db.all(`SELECT reason FROM warns WHERE user_id = ?`, [user.id], (err, rows) => {
      if (err) {
        console.error('Error fetching warnings from database:', err.message);
        return interaction.reply({ content: 'Wystąpił błąd podczas pobierania ostrzeżeń użytkownika.', ephemeral: true });
      }

      if (rows.length === 0) {
        return interaction.reply({ content: `Użytkownik ${user.tag} nie ma żadnych ostrzeżeń.`, ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Ostrzeżenia dla ${user.tag}`)
        .setColor('Yellow')
        .setFooter({ text: '© 2024 • ZygzakCode' })
        .setTimestamp();

      rows.forEach((row, index) => {
        embed.addFields({
          name: `Ostrzeżenie ${index + 1}`,
          value: `**Powód:** ${row.reason}\n`
        });
      });

      interaction.reply({ embeds: [embed], ephemeral: false });
    });
  },
};
