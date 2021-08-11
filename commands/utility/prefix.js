const db = require('../../db/db');

module.exports = {
  name: 'prefix',
  aliases: ['prefix'],
  category: "Utility",
  description: "Changes/Shows the bot prefix",
  cooldown: 3,
  options: [{
    name: 'prefix',
    type: 'STRING',
    description: 'New prefix',
    required: false,
  }],
  async execute (message, args, client, user) {
    let old_prefix = await db.fetch_prefix(message.guild.id);
    if (args.length < 1) return message.editReply({ content: `my prefix here is \`${old_prefix}\` <:mhml:847464650043555880>` });
    else if (!(args.length > 1)) {
      if (message.member.permissions.has("MANAGE_GUILD")||user.id==398061543373406208) {
        await db.add_guild(message.guild.id);
        await db.sql`update config set prefix = ${args[0]} where server_id = ${message.guild.id}`;
        return message.editReply({ content: `My prefix has been changed to \`${args[0]}\` <:mhml:847464650043555880>` });
      }
      else return message.editReply({ content: "You must have the permission `Manage Server` to be able to change the bot prefix." });
    }
    else return message.editReply({ content: "This command accepts a maximum of 1 argument." });
  }
}
