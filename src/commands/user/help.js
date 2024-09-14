const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription('Displays a list of available bot commands'),
    async execute(interaction) {
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

        const userCommands = loadCommandsFromFolder(path.resolve(__dirname, '../../commands/user'));
        const adminCommands = loadCommandsFromFolder(path.resolve(__dirname, '../../commands/admin'));

        const allCommands = userCommands.concat(adminCommands);

        const registeredCommands = await interaction.client.application.commands.fetch();
        const commandMap = new Map(registeredCommands.map(cmd => [cmd.name, cmd.id]));

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

        await interaction.reply({ embeds });
    }
};
