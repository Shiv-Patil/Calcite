const Discord = require("discord.js");

module.exports = {
  name: 'avatar',
  aliases: ['avatar', 'pfp', 'icon'],
  category: "Utility",
  description: "Displays an user's avatar",
  cooldown: 3,
  async execute (message, args, client, config) {
    let target;
    if (args.length < 1) target = message.author;
    else if (args.length > 1) return message.reply("this command accepts a maximum of 1 argument");
    else {
      let mentionID = args[0].trim().match(/^<@!?(\d+)>$/);
      if (!mentionID) mentionID = args[0].trim();
      else {mentionID = mentionID[1];}
      await client.users.fetch(mentionID).then((user) => {
        target = user;
      }).catch(console.error);
    }
    if (!target) return message.reply("please specify a valid user");
    const avatarEmbed = new Discord.MessageEmbed()
      .setAuthor(target.tag, target.displayAvatarURL({dynamic: true}))
      .setTitle("Avatar")
      .setImage(target.displayAvatarURL({size: 512}))
      .setFooter(message.author.tag, message.author.displayAvatarURL({dynamic: true}));
    return message.channel.send(avatarEmbed)
  }
}
