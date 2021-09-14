module.exports = {
  name: 'ping',
  aliases: ['ping'],
  category: "Utility",
  description: "Pong",
  cooldown: 3,
  async execute (message, args, client, user) {
    return message.editReply({ content: `Pong! ${Date.now() - message.createdTimestamp} ms.` });
  }
}
