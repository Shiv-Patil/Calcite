const Discord = require("discord.js");
const fs = require('fs');

module.exports = {
  name: 'prefix',
  aliases: ['prefix'],
  category: "Utility",
  description: "Changes/Shows the bot prefix",
  cooldown: 3,
  async execute (message, args, client, config) {
    if (args.length < 1) return message.reply(`my prefix here is \`${config.prefix}\` <:mhml:847464650043555880>`);
    else if (!(args.length > 1)) {
      let old_prefix = config.prefix;
      config.prefix = args[0];
      fs.writeFile("config.json", JSON.stringify(config), function(err) {
        if(err) {
          config.prefix = old_prefix;
          console.log(err);
          return message.reply("An error occured.");
        }
      });
      return message.reply(`my prefix has been changed to \`${config.prefix}\` <:mhml:847464650043555880>`);
    }
    else {return message.reply("This command accepts a maximum of 1 argument.");}
  }
}
