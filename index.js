const { loadCommands, loadEvents } = require("./handler");
const { Client, GatewayIntentBits, ActivityType, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ]
});


  



client.once('ready', async () => {
    console.log('Bot jest online!');
    
    await loadCommands(client);
    await loadEvents(client);
});

client.login(process.env.TOKEN);