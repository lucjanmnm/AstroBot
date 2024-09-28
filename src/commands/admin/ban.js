const { SlashCommandBuilder, Client, Interaction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Komenda do banowania użytkowników")
        .addUserOption(option => option.setName("użytkownik").setDescription("użytkownik do bana").setRequired(true))
        .addStringOption(option => option.setName("powód").setDescription("powód bana - automatycznie 'brak powodu'")),
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const banChannelId = '1287064901289902095';
        const logChannelId = '1287064901289902096';

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply({ content: "Nie posiadasz uprawnień do banowania członków." });
        }

        const target = await interaction.guild.members.fetch(interaction.options.getUser("użytkownik").id);
        if (!target) {
            return interaction.editReply({ content: "Tego użytkownika nie ma na serwerze" });
        }

        const rolePosition = {
            target: target.roles.highest.position,
            user: interaction.member.roles.highest.position,
            bot: interaction.guild.members.me.roles.highest.position
        };

        if (rolePosition.user < rolePosition.target) {
            return interaction.editReply({ content: "Ten użytkownik ma wyższą lub tą samą rolę co ty!" });
        }

        if (rolePosition.bot < rolePosition.target) {
            return interaction.editReply({ content: "Bot nie ma uprawnień do wykonania tego!" });
        }

        const reason = interaction.options?.getString("powód") || "Brak powodu";

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`❌ Zostałeś zbanowany na serwerze: ${interaction.guild.name}. Powód: ${reason}`);

            await target.send({ embeds: [dmEmbed] }).catch(err => {
                console.error("Failed to send DM to the banned user:", err);
            });

            await target.ban({ reason: reason });

            const logEmbed = new EmbedBuilder()
                .setTitle("Ban!")
                .setDescription(`**Użytkownik:** <@${target.id}> został zbanowany\n**Powód:** ${reason}\n**Moderator:** <@${interaction.user.id}>`)
                .setColor("Red")
                .setFooter({ text: ` © 2024 • ZygzakCode ` })
                .setTimestamp();

            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error(`Nie znaleziono kanału logów o ID ${logChannelId}`);
            }

            await interaction.channel.send({ embeds: [logEmbed] });

            const banChannel = await interaction.guild.channels.fetch(banChannelId);
            if (banChannel) {
                const banCount = await interaction.guild.bans.fetch().then(bans => bans.size);
                await banChannel.setName(`⛔ Bany: ${banCount}`);
            }

            await interaction.editReply({ content: `Użytkownik <@${target.id}> został pomyślnie zbanowany.` });
        } catch (error) {
            console.error("Error banning the user: ", error);
            interaction.editReply({ content: "Wystąpił błąd podczas próby zbanowania użytkownika." });
        }
    }
};
