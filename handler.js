const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * 
 * @param {string} dirPath - Ścieżka do folderu.
 * @returns {string[]} - Lista plików.
 */
function getAllFiles(dirPath) {
    let files = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(getAllFiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * 
 * @param {Client} client - Obiekt klienta Discord.
 */
async function loadCommands(client) {
    client.commands = new Collection();

    const folder = path.resolve(__dirname, "src/commands");
    const files = getAllFiles(folder);

    const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);

    const commands = [];

    for (const file of files) {
        try {
            const object = require(file);

            if (!object.data) continue;

            commands.push(object.data);

            client.commands.set(object.data.name, object.execute);

            console.log(`✅ Załadowano komendę: ${object.data.name}`);
        } catch (error) {
            console.error(`❌ Błąd podczas ładowania pliku: ${file}`);
            console.error(error);
        }
    }

    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
}

/**
 * 
 * @param {Client} client - Obiekt klienta Discord.
 */
async function loadEvents(client) {
    const folder = path.resolve(__dirname, "src/events");
    const files = fs.readdirSync(folder).map(el => path.join(folder, el));

    for (const file of files) {
        if (!fs.statSync(file).isFile()) continue;

        const object = require(file);

        if (!object.name) continue;

        client.on(object.name, (...args) => { object.execute(client, ...args); });

        console.log(`✅ Załadowano event: ${object.name}`);
    }
}

module.exports = {
    loadCommands,
    loadEvents
};
