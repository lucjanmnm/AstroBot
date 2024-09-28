const { SlashCommandBuilder, Client, Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Komenda wyświetlająca informacje o użytkowniku")
        .addUserOption(option => option.setName("user").setDescription("Użytkownik")),
    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        let statusEmoji;
        switch (member.presence?.status) {
            case 'online':
                statusEmoji = '🟢 Online';
                break;
            case 'idle':
                statusEmoji = '🟡 Zaraz wracam';
                break;
            case 'dnd':
                statusEmoji = '🔴 Nie przeszkadzać';
                break;
            case 'offline':
                statusEmoji = '⚫ Offline';
                break;
            default:
                statusEmoji = '⚫ Nie znany';
                break;
        }

        const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
        const gifAvatarUrl = user.displayAvatarURL({ format: 'gif', dynamic: true });
        const jpgAvatarUrl = user.displayAvatarURL({ format: 'jpg', dynamic: false });
        const webpAvatarUrl = user.displayAvatarURL({ format: 'webp', dynamic: true });

        const accountCreationTimestamp = Math.floor(user.createdAt.getTime() / 1000);
        const joinDateTimestamp = Math.floor(member.joinedAt.getTime() / 1000);

        const userInfoEmbed = new EmbedBuilder()
            .setTitle(`Informacje o użytkowniku ${user.username}`)
            .setColor("#0099ff")
            .setThumbnail(user.displayAvatarURL())
            .setDescription(
                '`👤` **Nick:** `' + user.username + '`' +
                '\n`🛠️` **ID:** `' + user.id + '`' +
                '\n`👑` **Utworzono konto:** <t:' + accountCreationTimestamp + ':F>' +
                '\n`🕑` **Dołączył na serwer:** <t:' + joinDateTimestamp + ':F>' +
                '\n`🌐` **Status:** `' + statusEmoji + '`' +
                '\n`🤩` **Avatar: **' +
                '[PNG](' + avatarUrl + ') | ' +
                '[GIF](' + gifAvatarUrl + ') | ' +
                '[JPG](' + jpgAvatarUrl + ') | ' +
                '[WEBP](' + webpAvatarUrl + ')'
            )
            .setFooter({text: ` © 2024 • AstroBot `})
            .setTimestamp();

        await interaction.editReply({ embeds: [userInfoEmbed] });
    }
};
