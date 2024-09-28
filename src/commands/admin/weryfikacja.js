const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
      .setImage('https://i.imgur.com/AIa9CgP.png')
      .setFooter({text: ` © 2024 • ZygzakCode `});

    const verificationButton = new ButtonBuilder()
      .setCustomId('verification_button')
      .setLabel('Weryfikacja')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(verificationButton);

    interaction.channel.send({ embeds: [verificationEmbed], components: [row] })
    await interaction.reply({ content: `Weryfikacja utworzona`, ephemeral: true });
  },
};
