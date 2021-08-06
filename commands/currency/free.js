const db = require('../../db/db');
const Discord = require("discord.js");
const utils = require('../../utils');

function getFreeCalcite (min=69, max=420) {
  return Math.round(Math.random()*(max-min)+min);
}

module.exports = {
  name: 'free',
  aliases: ['free', 'beg'],
  category: "Currency",
  description: "Gives free calcite",
  cooldown: 40,
  async execute (message, args, client, user) {
    let calcite;
    r = await db.sql`SELECT calcite FROM currency WHERE member_id=${user.id};`
    if (!r.length) {
      calcite = BigInt(100);
      await db.currency_add_user(user.id, calcite)
    }
    else calcite = r[0].calcite;
    let freeCalcite = getFreeCalcite();
    calcite += BigInt(freeCalcite);
    await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
    const balanceEmbed = new Discord.MessageEmbed()
      .setTitle('Free calcite')
      .setDescription(`Here, take ${freeCalcite} calcite.`)
    return message.editReply({ embeds: [balanceEmbed] });
  }
}
