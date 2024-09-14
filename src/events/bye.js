const { Client, GuildMember, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberRemove",
  /**
   * @param {Client} client
   * @param {GuildMember} member 
   */
  async execute(client, member) {
    const byeChannel = member.guild.channels.cache.get('1284195111038615561');

    if (byeChannel) {
      const people = member.guild.memberCount;

      const byeEmbed = new EmbedBuilder()
        .setTitle('Żegnaj użytkowniku!')
        .setDescription(`Żegnaj, <@${member.user.id}>! \n Pozostało **${people}** osób na serwerze.`)
        .setColor('Red')
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      await byeChannel.send({ embeds: [byeEmbed] });
    }
  }
};
