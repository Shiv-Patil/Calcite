const db = require('../../db/db');
const Discord = require("discord.js");
const utils = require('../../utils');

module.exports = {
  name: 'balance',
  aliases: ['balance', 'bal'],
  category: "Currency",
  description: "Shows your balance",
  cooldown: 3,
  options: [{
    name: 'user',
    type: 'USER',
    description: 'The user to get balance of',
    required: false,
  }],
  async execute (message, args, client, user) {
    if (args.length > 1) return message.editReply({ content: "this command accepts a maximum of 1 argument" });
    let target = user;
    let calcite;
    if (args.length) {
      target = await utils.parseMention(user, args[0], client);
    }
    r = await db.sql`SELECT calcite FROM currency WHERE member_id=${target.id};`
    if (!r.length) {
      calcite = BigInt(100);
      await db.currency_add_user(target.id, calcite)
    }
    else calcite = r[0].calcite;
    const balanceEmbed = new Discord.MessageEmbed()
      .setTitle('Balance')
      .setDescription(`Calcite: ${calcite}`)
      .setFooter(target.tag, target.displayAvatarURL({dynamic: true}));
    return message.editReply({ embeds: [balanceEmbed] });
  }
}
