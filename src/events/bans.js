const { Client, Guild, User } = require("discord.js");

module.exports = {
  name: "guildBanAdd",
  /**
   * @param {Client} client
   * @param {Guild} guild
   * @param {User} user
   */
  async execute(client, guild, user) {
    const banChannel = guild.channels.cache.get('1284195110615122006');

    if (banChannel) {
      const banCount = await guild.bans.fetch().then(bans => bans.size);
      await banChannel.setName(`⛔ Bans: ${banCount}`);
    }
  }
};
