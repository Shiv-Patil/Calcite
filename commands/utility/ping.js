const Discord = require("discord.js");

module.exports = {
  name: 'ping',
  aliases: ['ping'],
  category: "Utility",
  description: "Pong",
  cooldown: 3,
  async execute (message, args, client) {
    return message.channel.send("pong")
  }
}
