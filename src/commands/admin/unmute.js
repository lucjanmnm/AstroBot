const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Odciszenie użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do odciszenia')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do odciszania członków.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    try {
      await member.timeout(null, 'Unmute');

      const dmEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`✅ Zostałeś odciszony na serwerze: ${interaction.guild.name}.`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the unmuted user:', err);
      });

      const logChannel = interaction.channel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Unmute!')
          .setDescription(`> Użytkownik <@${user.id}> został odciszony\n\n**Moderator:**\n<@${interaction.user.id}>`)
          .setColor('Green')
          .setFooter({ text: '© 2024 • ZygzakCode' })
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error('Failed to find a valid log channel.');
      }

      interaction.reply({ content: `Użytkownik ${user.tag} został odciszony.`, ephemeral: true });
    } catch (error) {
      console.error('Error unmuting the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby odciszenia użytkownika.', ephemeral: true });
    }
  },
};
