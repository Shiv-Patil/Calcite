const Discord = require("discord.js");
const client = new Discord.Client();

module.exports = {
  name: 'ping',
  aliases: ['ping'],
  category: "Utility",
  description: "Pong",
  cooldown: 3,
  async execute (message, args, config) {
    return message.channel.send("pong")
  }
}
