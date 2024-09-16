const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../utils/warns');
const { checkWarningsAndApplyTempBan } = require('../../services/tempBan'); // Import the function

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Ostrzeżenie użytkownika')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik do ostrzeżenia')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód ostrzeżenia')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const reason = interaction.options.getString('powód') || 'Brak powodu';
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do ostrzegania członków.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    try {
      // Send DM to the user
      const dmEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setDescription(`⚠️ Zostałeś ostrzeżony na serwerze: ${interaction.guild.name}. Powód: ${reason}`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the warned user:', err);
      });

      // Log the warn
      const logChannel = interaction.channel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Warn!')
          .setDescription(`> Użytkownik <@${user.id}> został ostrzeżony\n\n**Powód:**\n ${reason}\n**Moderator:**\n<@${interaction.user.id}>`)
          .setColor('Yellow')
          .setFooter({ text: '© 2024 • ZygzakCode' })
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error('Failed to find a valid log channel.');
      }

      // Insert warn into database
      db.run(`INSERT INTO warns (user_id, guild_id, reason) VALUES (?, ?, ?)`, [user.id, guild.id, reason], async (err) => {
        if (err) {
          console.error('Error inserting warn into database:', err.message);
        }

        // Check if the user needs to be temporarily banned
        await checkWarningsAndApplyTempBan(interaction.client, user.id, guild.id); // Pass the client
      });

      interaction.reply({ content: `Użytkownik ${user.tag} został ostrzeżony za: ${reason}.`, ephemeral: true });
    } catch (error) {
      console.error('Error warning the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby ostrzeżenia użytkownika.', ephemeral: true });
    }
  },
};
