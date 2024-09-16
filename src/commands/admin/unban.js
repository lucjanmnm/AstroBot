const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Komenda do odbanowania użytkownika")
        .addStringOption(option => option.setName("id").setDescription("ID użytkownika").setRequired(true)),
    /**
     * 
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({ content: "Nie posiadasz uprawnień do odbanowania użytkowników." });
        }

        const userId = interaction.options.getString("id");

        try {
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(ban => ban.user.id === userId);

            if (!bannedUser) {
                return interaction.editReply({ content: "Ten użytkownik nie jest zbanowany." });
            }

            await interaction.guild.bans.remove(bannedUser.user, "Odbanowany przez administratora");

            const logChannel = interaction.channel;

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("Unban!")
                    .setDescription(`> Użytkownik o ID ${userId} został odbanowany\n\n**Moderator:**\n<@${interaction.user.id}>`)
                    .setColor("Yellow")
                    .setFooter({text: ` © 2024 • ZygzakCode `})
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error("Failed to find a valid log channel.");
            }

            const banChannel = interaction.guild.channels.cache.get('1284195110615122006'); 
            if (banChannel) {
                const bansCount = (await interaction.guild.bans.fetch()).size;
                await banChannel.setName(`⛔ Bany: ${bansCount}`);
            } else {
                console.error("Failed to find the ban log channel.");
            }

            await interaction.editReply({ content: `Użytkownik <@${userId}> został pomyślnie odbanowany.` });
        } catch (err) {
            console.error("Wystąpił błąd podczas odbanowania użytkownika:", err);
            interaction.editReply({ content: "Wystąpił błąd podczas odbanowania użytkownika." });
        }
    }
};
