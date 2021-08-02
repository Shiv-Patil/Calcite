const db = require('../../db');

module.exports = {
  name: 'prefix',
  aliases: ['prefix'],
  category: "Utility",
  description: "Changes/Shows the bot prefix",
  cooldown: 3,
  async execute (message, args, client) {
    let old_prefix = await db.fetch_prefix(message.guild.id);
    if (args.length < 1) return message.reply(`my prefix here is \`${old_prefix}\` <:mhml:847464650043555880>`);
    else if (!(args.length > 1)) {
      if (message.member.hasPermission("MANAGE_GUILD")) {
        await db.add_guild(message.guild.id);
        await db.sql`update config set prefix = ${args[0]} where server_id = ${message.guild.id}`;
        return message.reply(`my prefix has been changed to \`${args[0]}\` <:mhml:847464650043555880>`);
      }
      else return message.reply("You must have the permission `Manage Server` to be able to change the bot prefix.");
    }
    else return message.reply("This command accepts a maximum of 1 argument.");
  }
}
