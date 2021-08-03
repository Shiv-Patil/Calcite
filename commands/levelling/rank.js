const db = require('../../db/db');

module.exports = {
  name: 'rank',
  aliases: ['rank', 'level'],
  category: "Levelling",
  description: "Shows your rank and level",
  cooldown: 10,
  async execute (message, args, client) {
    let r = Array.from(await db.sql`
      SELECT * FROM level
      WHERE server_id=${message.guild.id}
      AND member_id=${message.author.id};
    `);
    if (!r.length) return message.reply("you don't have a level yet! Send messages to get a level.");
    const { server_id, member_id, level, xp, lastmsg } = r[0];
    return message.reply(`you are level ${level}.\nXp = ${xp}/${3*level**2+50*level+100}`);
  }
}
