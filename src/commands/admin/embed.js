const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
      .setName('embed')
      .setDescription('Tworzy osadzony komunikat.')
      .addStringOption(option => option.setName('title').setDescription('Tytuł osadzenia').setRequired(true))
      .addStringOption(option => option.setName('description').setDescription('Opis osadzenia').setRequired(true))
      .addStringOption(option => option.setName('color').setDescription('Kolor osadzenia (np. #0099ff)').setRequired(false))
      .addChannelOption(option => option.setName('channel').setDescription('Kanał docelowy').setRequired(false)),
    async execute(interaction) {

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'Nie masz uprawnień administratora.', ephemeral: true });
      }
  
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const color = interaction.options.getString('color') || '#0099ff';
      const channelOption = interaction.options.getChannel('channel');
      const channel = channelOption || interaction.channel;
  

      const embed = new EmbedBuilder()
      .setTitle(`${title}`)
      .setDescription(`${description}`)
      .setColor(`${color}`)
      .setTimestamp()
  
      return channel.send({ embeds: [embed] });
    },
  };
  