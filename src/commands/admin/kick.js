const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Wyrzuć użytkownika z serwera')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do wyrzucenia')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód wyrzucenia')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const reason = interaction.options.getString('powód') || 'Brak powodu';
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do wyrzucania członków.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    try {
      // Send DM to the user
      const dmEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`❌ Zostałeś wyrzucony z serwera: ${interaction.guild.name}. Powód: ${reason}`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the kicked user:', err);
      });

      await member.kick(reason);

      // Log the kick
      const logChannel = interaction.channel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Kick!')
          .setDescription(`> Użytkownik <@${user.id}> został wyrzucony\n\n**Powód:**\n ${reason}\n**Moderator:**\n<@${interaction.user.id}>`)
          .setColor('Red')
          .setFooter({ text: '© 2024 • ZygzakCode' })
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error('Failed to find a valid log channel.');
      }

      interaction.reply({ content: `Użytkownik ${user.tag} został wyrzucony za: ${reason}.`, ephemeral: true });
    } catch (error) {
      console.error('Error kicking the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby wyrzucenia użytkownika.', ephemeral: true });
    }
  },
};
