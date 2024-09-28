const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../utils/warns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Ban czasowy')
    .addUserOption(option =>
      option.setName('użytkownik')
        .setDescription('Użytkownik')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('czas')
        .setDescription('Czas w minutach')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('powód')
        .setDescription('Powód bana')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('użytkownik');
    const time = interaction.options.getInteger('czas');
    const guild = interaction.guild;
    const member = guild.members.cache.get(user.id);
    const reason = interaction.options.getString('powód') || 'Brak powodu';
    const banChannelId = '1284195110615122006';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'Nie posiadasz uprawnień do banowania członków.', ephemeral: true });
    }

    if (!member) {
      return interaction.reply({ content: 'Tego użytkownika nie ma na serwerze.', ephemeral: true });
    }

    const unbanTime = Date.now() + (time * 60 * 1000);

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`❌ Zostałeś tymczasowo zbanowany na serwerze: ${interaction.guild.name}. Powód: ${reason} na czas: ${time} minut`);
      await user.send({ embeds: [dmEmbed] }).catch(err => {
        console.error('Failed to send DM to the banned user:', err);
      });

      await member.ban({ reason: `Temp ban za: ${reason} na czas: ${time} minut` });

      const logChannel = interaction.channel;
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Temp Ban!')
          .setDescription(`> Użytkownik <@${user.id}> został tymczasowo zbanowany\n\n**Powód:**\n ${reason}\n**Czas:**\n ${time} minut\n**Moderator:**\n<@${interaction.user.id}>`)
          .setColor('Red')
          .setFooter({ text: '© 2024 • ZygzakCode' })
          .setTimestamp();
          interaction.reply({ embeds: [logEmbed] });
      } else {
        console.error('Failed to find a valid log channel.');
      }

      db.run(`INSERT INTO temp_bans (user_id, guild_id, unban_time) VALUES (?, ?, ?)`, [user.id, guild.id, unbanTime], (err) => {
        if (err) {
          console.error('Error inserting temporary ban into database:', err.message);
        }
      });

      const banChannel = await interaction.guild.channels.fetch(banChannelId);
      if (banChannel) {
        const banCount = await interaction.guild.bans.fetch().then(bans => bans.size);
        await banChannel.setName(`⛔ Bany: ${banCount}`);
      }

      setTimeout(async () => {
        try {
          await guild.members.unban(user.id, 'Temp ban skonczył się.');
        } catch (err) {
          console.error('Error unbanning user:', err.message);
        }

        db.run(`DELETE FROM temp_bans WHERE user_id = ? AND guild_id = ?`, [user.id, guild.id], (err) => {
          if (err) {
            console.error('Error deleting temporary ban from database:', err.message);
          }
        });
      }, time * 60 * 1000); 
    } catch (error) {
      console.error('Error banning the user: ', error);
      interaction.reply({ content: 'Wystąpił błąd podczas próby zbanowania użytkownika.', ephemeral: true });
    }
  },
};
