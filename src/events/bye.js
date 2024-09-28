const { Client, GuildMember, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberRemove",
  /**
   * @param {Client} client
   * @param {GuildMember} member 
   */
  async execute(client, member) {
    const byeChannel = member.guild.channels.cache.get('1287064899964506128');

    if (byeChannel) {
      const people = member.guild.memberCount;

      const byeEmbed = new EmbedBuilder()
        .setTitle(`Żegnaj ${member.user.username} opuściłeś ZygzakCode - Usługi Minecraft!`)
        .setDescription(`<@${member.user.id}> mamy nadzieję, że kiedyś do nas wrócisz 😭\n-# Aktualnie posiadamy: **${people}** osób.`)
        .setColor('Red')
        .setThumbnail(member.user.displayAvatarURL())
        .setImage('https://i.imgur.com/3sGcOFa.png')
        .setFooter({text: ` © 2024 • ZygzakCode `})
        .setTimestamp();

      await byeChannel.send({ embeds: [byeEmbed] });
    }
  }
};