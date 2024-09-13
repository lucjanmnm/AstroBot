const { Client } = require("discord.js");
const { loadCommands } = require("../../handler")

module.exports = {
    name: "ready",
    /**
     * 
     * @param {Client} client 
     */
    async execute(client) {
        loadCommands(client);
    }
}