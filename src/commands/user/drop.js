const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Losuje zniżkę na AstroBot'),
  async execute(interaction) {
    const allowedChannelId = '1284195111575748718';
    const logChannelId = '1284195111726485565';

    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: 'Ta komenda może być użyta tylko na <#1284195111575748718>.',
        ephemeral: true
      });
    }

    const isWinner = Math.random() < 0.3;
    const logChannel = interaction.client.channels.cache.get(logChannelId);
    
    const discountMessages = [
      `# Wygrałeś/aś <@${interaction.user.id}>\n- Wygrałeś/aś zniżke na skrypt -5%.\n- Zgłoś się na ticket, aby użyć zniżki!`,
      `# Wygrałeś/aś <@${interaction.user.id}>\n- Wygrałeś/aś zniżke na mape -10%.\n- Zgłoś się na ticket, aby użyć zniżki!`,
      `# Wygrałeś/aś <@${interaction.user.id}>\n- Wygrałeś/aś zniżke na grafike -15%.\n- Zgłoś się na ticket, aby użyć zniżki!`
    ];
    
    const winMessage = discountMessages[Math.floor(Math.random() * discountMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle('Wynik Dropa')
      .setDescription(isWinner ? winMessage : `# Nie Wygrałeś/aś <@${interaction.user.id}>\n- Niestety przegrałeś/aś spróbuj za 6 godzin\n- Za 6 godzin możesz spróbować i możesz wygrać!`)
      .setColor(isWinner ? '#00FF00' : '#FF0000')
      .setFooter({text: ` © 2024 • AstroBot `})
      .setTimestamp();

    const win = new EmbedBuilder()
      .setTitle('WYGRANA')
      .setDescription(winMessage)
      .setColor('#00FF00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    if (isWinner && logChannel) {
      logChannel.send({ embeds: [win] });
    } else if (!logChannel) {
      console.error(`Nie znaleziono kanału logów o ID ${logChannelId}`);
    }
  },
};
