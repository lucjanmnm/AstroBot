const { Client, Interaction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/giveawayDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Zarządzaj giveaway')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Rozpocznij giveaway')
        .addStringOption(option => option.setName('nazwa').setDescription('Nazwa giveaway').setRequired(true))
        .addStringOption(option => option.setName('opis').setDescription('Opis giveaway').setRequired(true))
        .addIntegerOption(option => option.setName('wygrani').setDescription('Liczba wygranych').setRequired(true))
        .addIntegerOption(option => option.setName('czas').setDescription('Czas w minutach').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reroll')
        .setDescription('Powtórz losowanie')
        .addStringOption(option => option.setName('nazwa').setDescription('Nazwa giveaway').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edytuj giveaway')
        .addStringOption(option => option.setName('stara-nazwa').setDescription('Stara nazwa giveaway').setRequired(true))
        .addStringOption(option => option.setName('nowa-nazwa').setDescription('Nowa nazwa').setRequired(true))
        .addStringOption(option => option.setName('opis').setDescription('Nowy opis').setRequired(true))
        .addIntegerOption(option => option.setName('wygrani').setDescription('Nowa liczba wygranych').setRequired(true))
        .addIntegerOption(option => option.setName('czas').setDescription('Nowy czas w minutach').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('Zakończ giveaway')
        .addStringOption(option => option.setName('nazwa').setDescription('Nazwa giveaway').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('cancel')
        .setDescription('Anuluj giveaway')
        .addStringOption(option => option.setName('nazwa').setDescription('Nazwa giveaway').setRequired(true))),

  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('join_')) {
        const giveawayName = interaction.customId.split('_')[1];
        const participants = await db.getParticipants(giveawayName);

        if (participants.includes(interaction.user.username)) {
          await db.removeParticipant(giveawayName, interaction.user.username);
          await interaction.reply({ content: `Opuściłeś giveaway "${giveawayName}".`, ephemeral: true });
        } else {
          await db.addParticipant(giveawayName, interaction.user.username);
          await interaction.reply({ content: `Dołączyłeś do giveaway "${giveawayName}"!`, ephemeral: true });
        }
        return;
      }
    }

    if (interaction.isCommand() && interaction.commandName === 'giveaway') {
      const subCommand = interaction.options.getSubcommand();

      if (subCommand === 'start') {
        const name = interaction.options.getString('nazwa');
        const description = interaction.options.getString('opis');
        const winners = interaction.options.getInteger('wygrani');
        const time = interaction.options.getInteger('czas') * 60 * 1000;

        const embed = new EmbedBuilder()
          .setTitle(name)
          .setDescription(description)
          .setColor('#FF0000')
          .setFooter({ text: 'Kliknij przycisk poniżej, aby dołączyć!' })
          .setTimestamp();

        const buttonRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`join_${name}`)
              .setLabel('Dołącz')
              .setStyle(ButtonStyle.Primary)
          );

        await interaction.reply({ content: `Giveaway "${name}" rozpoczęty!`, ephemeral: true });
        const message = await interaction.channel.send({ embeds: [embed], components: [buttonRow] });

        await db.addGiveaway(name, description, winners, Date.now() + time);

        setTimeout(async () => {
          const giveaway = await db.getGiveaway(name);
          const participants = await db.getParticipants(name);
          const winner = participants[Math.floor(Math.random() * participants.length)];
          const resultEmbed = new EmbedBuilder()
            .setTitle(`Giveaway Zakończony!`)
            .setDescription(`Wygrał: ${winner || 'Brak uczestników'}`)
            .setColor('#00FF00');

          await interaction.channel.send({ embeds: [resultEmbed] });
          await db.deleteGiveaway(name);
        }, time);
      }

      if (subCommand === 'reroll') {
        const name = interaction.options.getString('nazwa');
        const giveaway = await db.getGiveaway(name);

        if (giveaway) {
          const participants = await db.getParticipants(name);
          const winner = participants[Math.floor(Math.random() * participants.length)];
          await interaction.reply({ content: `Nowym zwycięzcą jest: ${winner || 'Brak uczestników'}`, ephemeral: true });
        } else {
          await interaction.reply({ content: `Nie znaleziono giveaway o nazwie "${name}".`, ephemeral: true });
        }
      }

      if (subCommand === 'edit') {
        const oldName = interaction.options.getString('stara-nazwa');
        const newName = interaction.options.getString('nowa-nazwa');
        const description = interaction.options.getString('opis');
        const winners = interaction.options.getInteger('wygrani');
        const time = interaction.options.getInteger('czas');

        await db.updateGiveaway(oldName, newName, description, winners, Date.now() + time * 60 * 1000);
        await interaction.reply({ content: `Giveaway "${oldName}" został zaktualizowany!`, ephemeral: true });
      }

      if (subCommand === 'end') {
        const name = interaction.options.getString('nazwa');
        const participants = await db.getParticipants(name);
        const winner = participants[Math.floor(Math.random() * participants.length)];

        const resultEmbed = new EmbedBuilder()
          .setTitle(`Giveaway Zakończony!`)
          .setDescription(`Wygrał: ${winner || 'Brak uczestników'}`)
          .setColor('#00FF00');

        await interaction.channel.send({ embeds: [resultEmbed] });
        await db.deleteGiveaway(name);
        await interaction.reply({ content: `Giveaway "${name}" został zakończony!`, ephemeral: true });
      }

      if (subCommand === 'cancel') {
        const name = interaction.options.getString('nazwa');
        await db.deleteGiveaway(name);
        await interaction.reply({ content: `Giveaway "${name}" został anulowany!`, ephemeral: true });
      }
    }
  }
};
