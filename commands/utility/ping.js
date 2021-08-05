module.exports = {
  name: 'ping',
  aliases: ['ping'],
  category: "Utility",
  description: "Pong",
  cooldown: 3,
  async execute (message, args, client) {
    if (args) {
      message.editReply = message.reply;
    }
    return message.editReply({ content: `Pong! ${Date.now() - message.createdTimestamp} ms.` });
  }
}
