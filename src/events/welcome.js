const { Client, GuildMember, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  /**
   * @param {Client} client
   * @param {GuildMember} member 
   */
  async execute(client, member) {
        const welcomeChannel = member.guild.channels.cache.get('1287064899964506128');
        const userChannel = member.guild.channels.cache.get('1287064899964506124');
        const newUserChannel = member.guild.channels.cache.get('1287064899964506126');

        if (welcomeChannel) {
          const people = member.guild.memberCount;

          const welcomeEmbed = new EmbedBuilder()
          .setTitle(`Witaj ${member.user.username} na AstroBot!`)
          .setDescription(`<@${member.user.id}> mamy nadzieję, że zostaniesz u nas na dłużej 😁\n-# Aktualnie posiadamy: **${people}** osób.`)
            .setColor('Green')
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({text: ` © 2024 • AstroBot `})
            .setTimestamp();

          await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } 


        if (userChannel) {
          const people = member.guild.memberCount;
          await userChannel.setName(`🧒・Osób: ${people}`);
        }

        if (newUserChannel) {
          await newUserChannel.setName(`🔗・Dołączył: ${member.user.username}`);
        }
    } 
};