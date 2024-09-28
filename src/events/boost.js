const { Client, GuildMember, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",
  /**
   * @param {Client} client
   * @param {GuildMember} oldMember
   * @param {GuildMember} newMember
   */
  async execute(client, oldMember, newMember) {
    const boostChannel = newMember.guild.channels.cache.get('1287064899964506129');

    if (!boostChannel) return;

    const oldBoost = oldMember.premiumSince;
    const newBoost = newMember.premiumSince;

    if (!oldBoost && newBoost) {
      const boosts = newMember.guild.premiumSubscriptionCount;

      const boostEmbed = new EmbedBuilder()
        .setTitle('Dziękujemy za Boost!')
        .setDescription(`Dziękujemy, <@${newMember.user.id}> za zboostowanie serwera! \n Serwer ma teraz **${boosts}** boostów!`)
        .setColor('Purple')
        .setThumbnail(newMember.user.displayAvatarURL())
        .setFooter({text: ` © 2024 • ZygzakCode `})
        .setTimestamp();

      await boostChannel.send({ embeds: [boostEmbed] });
    }
  }
};
