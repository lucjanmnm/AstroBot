const { SlashCommandBuilder } = require('discord.js');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const db = require('../../utils/giveawayDatabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Zarządzaj giveaway')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Rozpocznij giveaway')
        .addStringOption(option =>
          option.setName('nazwa').setDescription('Nazwa giveaway').setRequired(true)
        )
        .addStringOption(option =>
          option.setName('opis').setDescription('Opis giveaway').setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('wygrani').setDescription('Liczba wygranych').setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('czas').setDescription('Czas w minutach').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reroll')
        .setDescription('Powtórz losowanie')
        .addStringOption(option =>
          option.setName('id_wiadomości').setDescription('ID wiadomości giveaway').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('Zakończ giveaway')
        .addStringOption(option =>
          option.setName('id_wiadomości').setDescription('ID wiadomości giveaway').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cancel')
        .setDescription('Anuluj giveaway')
        .addStringOption(option =>
          option.setName('id_wiadomości').setDescription('ID wiadomości giveaway').setRequired(true)
        )
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === 'start') {
      const name = interaction.options.getString('nazwa');
      const description = interaction.options.getString('opis');
      const winners = interaction.options.getInteger('wygrani');
      const time = interaction.options.getInteger('czas') * 60 * 1000;
      const endTime = Date.now() + time;

      const embed = new EmbedBuilder()
        .setTitle(name)
        .setDescription(description)
        .setColor('#FF0000')
        .setFooter({ text: 'Kliknij przycisk poniżej, aby dołączyć!' })
        .addFields(
          { name: 'Czas do zakończenia', value: `<t:${Math.floor(endTime / 1000)}:R>` },
          { name: 'Liczba uczestników', value: '0', inline: true }
        )
        .setTimestamp();

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`join_${name}`)
          .setLabel('Dołącz')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: `Giveaway "${name}" rozpoczęty!`,
        ephemeral: true,
      });

      const giveawayMessage = await interaction.channel.send({
        embeds: [embed],
        components: [buttonRow],
      });

      const giveawayId = await db.addGiveaway(name, description, winners, endTime, giveawayMessage.id);

      setTimeout(async () => {
        const giveaway = await db.getGiveawayByMessageId(giveawayMessage.id);
        if (!giveaway) return;

        const participants = await db.getParticipants(giveawayId);
        if (participants.length === 0) {
          await interaction.channel.send(`Giveaway "${name}" zakończony. Brak uczestników.`);
        } else {
          const winnersList = [];
          for (let i = 0; i < Math.min(winners, participants.length); i++) {
            const winnerIndex = Math.floor(Math.random() * participants.length);
            winnersList.push(participants[winnerIndex]);
            participants.splice(winnerIndex, 1);
          }

          const resultEmbed = new EmbedBuilder()
            .setTitle(`Giveaway Zakończony!`)
            .setDescription(`Wygrał: ${winnersList.join(', ')}`)
            .setColor('#00FF00');

          await interaction.channel.send({ embeds: [resultEmbed] });
        }

        // Giveaway won't be deleted from the database to keep the record
        // await db.deleteGiveaway(name);
      }, time);
    }

    if (subCommand === 'reroll') {
      const messageId = interaction.options.getString('id_wiadomości');
      const giveaway = await db.getGiveawayByMessageId(messageId);

      if (!giveaway) {
        return interaction.reply({
          content: `Nie znaleziono giveaway o ID wiadomości "${messageId}".`,
          ephemeral: true,
        });
      }

      const participants = await db.getParticipants(giveaway.id);
      if (participants.length === 0) {
        return interaction.reply({
          content: `Brak uczestników w giveaway "${giveaway.name}".`,
          ephemeral: true,
        });
      }

      const winner = participants[Math.floor(Math.random() * participants.length)];
      interaction.reply({
        content: `Nowym zwycięzcą jest: ${winner}`,
        ephemeral: true,
      });
    }

    if (subCommand === 'end') {
      const messageId = interaction.options.getString('id_wiadomości');
      const giveaway = await db.getGiveawayByMessageId(messageId);

      if (!giveaway) {
        return interaction.reply({
          content: `Nie znaleziono giveaway o ID wiadomości "${messageId}".`,
          ephemeral: true,
        });
      }

      const participants = await db.getParticipants(giveaway.id);
      if (participants.length === 0) {
        await interaction.channel.send(`Giveaway "${giveaway.name}" zakończony. Brak uczestników.`);
      } else {
        const winnersList = [];
        for (let i = 0; i < Math.min(giveaway.winners, participants.length); i++) {
          const winnerIndex = Math.floor(Math.random() * participants.length);
          winnersList.push(participants[winnerIndex]);
          participants.splice(winnerIndex, 1);
        }

        const resultEmbed = new EmbedBuilder()
          .setTitle(`Giveaway Zakończony!`)
          .setDescription(`Wygrał: <@${winnersList.join(', ')}>`)
          .setColor('#00FF00');

        await interaction.channel.send({ embeds: [resultEmbed] });
      }

      // Giveaway won't be deleted from the database to keep the record
      // await db.deleteGiveaway(name);
    }

    if (subCommand === 'cancel') {
      const messageId = interaction.options.getString('id_wiadomości');
      const giveaway = await db.getGiveawayByMessageId(messageId);

      if (!giveaway) {
        return interaction.reply({
          content: `Nie znaleziono giveaway o ID wiadomości "${messageId}".`,
          ephemeral: true,
        });
      }

      // Giveaway won't be deleted from the database to keep the record
      // await db.deleteGiveaway(name);
      interaction.reply({
        content: `Giveaway "${giveaway.name}" został anulowany.`,
        ephemeral: true,
      });
    }
  },
};
