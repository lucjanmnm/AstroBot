const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Usuń ostrzeżenie użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do usuwania ostrzeżeń.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    try {
      db.run(`DELETE FROM warns WHERE user_id = ? AND guild_id = ?`, [user.id, guild.id], (err) => {
        if (err) {
          console.error('Error deleting warn from database:', err.message);
          return interaction.reply({ content: 'Wystąpił błąd podczas próby usunięcia ostrzeżenia użytkownika.', ephemeral: true });
        }
        interaction.reply({ content: `Ostrzeżenia dla użytkownika ${user.tag} zostały usunięte.`, ephemeral: true });
      });

      const dmEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`✅ Twoje ostrzeżenia na serwerze: ${interaction.guild.name} zostały usunięte.`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the unwarned user:', err);
      });

      const logChannel = interaction.channel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Unwarn!')
          .setDescription(`> Ostrzeżenia dla użytkownika <@${user.id}> zostały usunięte\n\n**Moderator:**\n<@${interaction.user.id}>`)
          .setColor('Green')
          .setFooter({ text: '© 2024 • ZygzakCode' })
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error('Failed to find a valid log channel.');
      }
    } catch (error) {
      console.error('Error removing warn from the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby usunięcia ostrzeżenia użytkownika.', ephemeral: true });
    }
  },
};
