const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Wycisz użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do wyciszenia')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('czas')
        .setDescription('Czas wyciszenia w minutach')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód wyciszenia')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const time = interaction.options.getInteger('czas');
    const reason = interaction.options.getString('powód') || 'Brak powodu';
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);
    const logChannelId = '1287064901289902096';
    const logChannel = interaction.client.channels.cache.get(logChannelId);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do wyciszania członków.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    try {
      const muteDuration = time * 60 * 1000;

      await member.timeout(muteDuration, reason);

      const dmEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`🔇 Zostałeś wyciszony na serwerze: ${interaction.guild.name} na ${time} minut. Powód: ${reason}`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the muted user:', err);
      });

      const currentChannelLogEmbed = new EmbedBuilder()
        .setTitle('Mute!')
        .setDescription(`> Użytkownik <@${user.id}> został wyciszony na ${time} minut\n\n**Powód:**\n ${reason}\n**Moderator:**\n<@${interaction.user.id}>`)
        .setColor('Red')
        .setFooter({ text: '© 2024 • AstroBot' })
        .setTimestamp();
      await interaction.channel.send({ embeds: [currentChannelLogEmbed] });

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Mute!')
          .setDescription(`**Użytkownik:** <@${user.id}>\n**Czas:** ${time} minut.\n**Powód:** ${reason}\n**Moderator:** <@${interaction.user.id}>`)
          .setColor('Purple')
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error(`Nie znaleziono kanału logów o ID ${logChannelId}`);
      }

      interaction.reply({ content: `Użytkownik ${user.tag} został wyciszony na ${time} minut za: ${reason}.`, ephemeral: true });
    } catch (error) {
      console.error('Error muting the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby wyciszenia użytkownika.', ephemeral: true });
    }
  },
};
