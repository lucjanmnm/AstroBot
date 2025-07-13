const { SlashCommandBuilder, PermissionFlagsBits, Client, Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Usuwa określoną liczbę wiadomości.')
        .addIntegerOption(option => option.setName('amount').setDescription('Liczba wiadomości do usunięcia').setRequired(true)),
  
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        const logChannelId = '1284195111726485565';

        if (!interaction.member || !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'Nie masz uprawnień do zarządzania wiadomościami.', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');

        if (amount <= 0 || amount > 100) {
            return interaction.reply({ content: `Liczba ${amount} jest błędna! Spróbuj ponownie z poprawną liczbą (1-100)`, ephemeral: true });
        }

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });

            const messagesToDelete = fetchedMessages.filter(msg => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
            const messagesToDeleteIndividually = fetchedMessages.filter(msg => Date.now() - msg.createdTimestamp >= 14 * 24 * 60 * 60 * 1000);

            if (messagesToDelete.size > 0) {
                await interaction.channel.bulkDelete(messagesToDelete, true);
            }

            for (const msg of messagesToDeleteIndividually.values()) {
                await msg.delete();
            }

            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🗑️ Clear")
                    .setDescription(`**Liczba:** ${fetchedMessages.size}\n**Kanał:** ${interaction.channel}\n**Użytkownik:** <@${interaction.user.id}>`)
                    .setColor("White")
                    .setFooter({ text: ` © 2024 • AstroBot ` })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error(`Nie znaleziono kanału logów o ID ${logChannelId}`);
            }

            return interaction.reply({ content: `🗑️ Usunięto ${fetchedMessages.size} wiadomości.`, ephemeral: true });

        } catch (error) {
            console.error('Błąd przy usuwaniu wiadomości:', error);
            return interaction.reply({ content: 'Wystąpił błąd przy usuwaniu wiadomości. Spróbuj ponownie później.', ephemeral: true });
        }
    },
};
