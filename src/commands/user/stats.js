const { SlashCommandBuilder, EmbedBuilder, client } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Pokazuje informacje bota'),

    async execute(interaction, client) {
        const startTime = Date.now();
        await interaction.deferReply();
        const endTime = Date.now();
        const latency = endTime - startTime;

        const embed = new EmbedBuilder()
        .setTitle('`📊` Statystyki')
        .setDescription('`🏓` **Ping:** `' + `${latency}ms` + '`')
        interaction.editReply({ embeds: [embed]});
    }
}