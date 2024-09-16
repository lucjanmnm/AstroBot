const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weryfikacja')
    .setDescription('Generuje formularz weryfikacji.'),

  /**
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'Nie masz uprawnień do użycia tej komendy.', ephemeral: true });
    }

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;

    client.tempMathProblem = { num1, num2, correctAnswer };

    const verificationEmbed = new EmbedBuilder()
      .setTitle('Weryfikacja || ZygzakCraft.pl')
      .setDescription('Witaj, aby się zweryfikować należy kliknąć przycisk poniżej.\n・Pamiętaj, wchodząc na serwer akceptujesz automatycznie regulamin serwera')
      .setFooter({text: ` © 2024 • ZygzakCode `});

    const verificationButton = new ButtonBuilder()
      .setCustomId('verification_button')
      .setLabel('Weryfikacja')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(verificationButton);

    await interaction.reply({ embeds: [verificationEmbed], components: [row] });
  },
};
