const Discord = require("discord.js");

module.exports = {
  name: 'avatar',
  aliases: ['avatar', 'av', 'pfp', 'icon'],
  category: "Utility",
  description: "Displays an user's avatar",
  cooldown: 3,
  options: [{
    name: 'user',
    type: 'USER',
    description: 'The user to get avatar of',
    required: false,
  }],
  async execute (message, args, client, user) {
    let target;
    if (args.length < 1) target = user;
    else if (args.length > 1) return message.editReply({ content: "this command accepts a maximum of 1 argument" });
    else {
      let mentionID = args[0].trim().match(/^<@!?(\d+)>$/);
      if (!mentionID) mentionID = args[0].trim();
      else {mentionID = mentionID[1];}
      try {
        target = await client.users.fetch(mentionID);
      } catch (error) {
        target = undefined;
      }
    }
    console.log(target.id.toString());
    if (!target) return message.editReply({ content: "please specify a valid user" });
    const avatarEmbed = new Discord.MessageEmbed()
      .setAuthor(target.tag, target.displayAvatarURL({dynamic: true}))
      .setTitle("Avatar")
      .setImage(target.displayAvatarURL({size: 512, dynamic: true}))
      .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
    return message.editReply({ embeds: [avatarEmbed] })
  }
}
