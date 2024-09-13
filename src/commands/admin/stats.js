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
        .setDescription('`👾` **Wersja bota:** `Alpha 1.0.0` \n`🖥️` **Liczba serwerów:** `' + `${client.guilds.cache.size}` + '`' + '\n`🏓` **Ping:** `' + `${latency}ms` + '`')
        interaction.editReply({ embeds: [embed]});
    }
}