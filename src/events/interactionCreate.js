const { Client, Interaction } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    async execute(client, interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: "Ta komenda nie może być używana w wiadomościach prywatnych.", ephemeral: true });
        }

        if (interaction.isCommand()) {
            if (!client.commands.has(interaction.commandName)) return;
    
            const interactionFunction = client.commands.get(interaction.commandName);
    
            if (interaction.deferred || interaction.replied) return;
    
            interactionFunction(interaction, client);
        }
    }
}
