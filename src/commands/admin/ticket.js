const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Utwórz zgłoszenie'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.editReply({ content: "Nie posiadasz uprawnień do banowania członków." });
    }

    const embed = new EmbedBuilder()
      .setTitle('Zgłoszenie')
      .setDescription('Wybierz typ zgłoszenia z menu poniżej')
      .setColor('#00FF00')
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_ticket_type')
          .setPlaceholder('Wybierz typ zgłoszenia')
          .addOptions([
            {
              label: 'Pomoc ogólna',
              description: 'Ogólna pomoc',
              value: 'pomoc_ogolna',
            },
            {
              label: 'Skrypty-Pluginy',
              description: 'Pomoc ze skryptami i pluginami',
              value: 'skrypty_pluginy',
            },
            {
              label: 'Grafika',
              description: 'Pomoc z grafiką',
              value: 'grafika',
            },
            {
              label: 'Partnerstwo',
              description: 'Prośba o partnerstwo',
              value: 'partnerstwo',
            },
            {
              label: 'Rekrutacja',
              description: 'Prośba o rekrutację',
              value: 'rekrutacja',
            },
            {
              label: 'Strefa Premium',
              description: 'Pomoc w strefie premium',
              value: 'strefa_premium',
            },
            {
              label: 'Chce kupić paczkę',
              description: 'Prośba o kupno paczki',
              value: 'kupno_paczki',
            },
            {
              label: 'Zwrot rangi',
              description: 'Prośba o zwrot rangi',
              value: 'zwrot_rangi',
            },
            {
              label: 'Chce coś kupić',
              description: 'Prośba o kupno',
              value: 'cos_kupic',
            },
          ])
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
