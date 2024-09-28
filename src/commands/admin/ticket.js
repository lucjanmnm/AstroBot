const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Utwórz zgłoszenie'),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "Nie posiadasz uprawnień do banowania członków.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Zgłoszenie')
      .setDescription('Wybierz typ zgłoszenia z menu poniżej')
      .setColor('#00FF00')
      .setFooter({ text: `© 2024 • ZygzakCode` })
      .setTimestamp()
      .setImage('https://i.imgur.com/IjtLcc8.png');

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

    interaction.channel.send({embeds: [embed], components: [row]})
    await interaction.reply({content: `Stworzono ticket handler.`, ephemeral: true});
  },
};
