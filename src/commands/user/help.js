const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription('Displays a list of available bot commands'),
    async execute(interaction) {
        // Funkcja pomocnicza do ładowania komend z folderów
        function loadCommandsFromFolder(folderPath) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            const commands = [];

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if (command.data) {
                    commands.push({
                        name: command.data.name,
                        description: command.data.description || 'No description available'
                    });
                }
            }

            return commands;
        }

        // Ładowanie komend z folderów user i admin
        const userCommands = loadCommandsFromFolder(path.resolve(__dirname, '../../commands/user'));
        const adminCommands = loadCommandsFromFolder(path.resolve(__dirname, '../../commands/admin'));

        const allCommands = userCommands.concat(adminCommands);

        // Pobierz zarejestrowane komendy z API Discorda
        const registeredCommands = await interaction.client.application.commands.fetch();
        const commandMap = new Map(registeredCommands.map(cmd => [cmd.name, cmd.id]));

        // Wzbogac lokalne komendy o identyfikatory
        const commandsWithIds = allCommands.map(command => ({
            name: command.name,
            description: command.description,
            id: commandMap.get(command.name) || 'ID not found'
        }));

        if (!commandsWithIds.length) {
            const embed = new EmbedBuilder()
                .setTitle('`⚒️` List of Bot Commands')
                .setDescription('No commands available.')
                .setColor('Yellow');

            return await interaction.reply({ embeds: [embed] });
        }

        // Podziel komendy na grupy po 25
        const embeds = [];
        for (let i = 0; i < commandsWithIds.length; i += 25) {
            const currentCommands = commandsWithIds.slice(i, i + 25);
            const embed = new EmbedBuilder()
                .setTitle('`⚒️` List of Bot Commands')
                .setDescription('`»` Available bot commands in Alpha 1.0.0 `«`')
                .setColor('Yellow');

            currentCommands.forEach((command, index) => {
                embed.addFields({
                    name: "`»` " + `${i + index + 1}. </${command.name}:${command.id}>`,
                    value: command.description,
                    inline: true
                });
            });

            embeds.push(embed);
        }

        // Wyślij wszystkie embedowane wiadomości
        await interaction.reply({ embeds });
    }
};
