module.exports = {
  name: 'ping',
  aliases: ['ping'],
  category: "Utility",
  description: "Pong",
  cooldown: 3,
  async execute (message, args, client) {
    return message.channel.send(`Pong! ${Date.now() - message.createdTimestamp} ms.`);
  }
}
