const { join } = require("path");
const utils = require('./utils/math.js');
const db = require(join(__dirname, "db", "db"));
const Discord = require("discord.js");

module.exports = {
  async on_msg(client, message) {

    if (!client.levelling.has(message.guild.id)) {
      client.levelling.set(message.guild.id, new Discord.LimitedCollection({sweepInterval:60, sweepFilter:function(coll){return function(){return true}}}));
    }
    if (!client.levelling.get(message.guild.id).get(message.author.id)) {
      client.levelling.get(message.guild.id).set(message.author.id, true);

      let r = await db.sql`
        SELECT * FROM level
        WHERE server_id=${message.guild.id}
        AND member_id=${message.author.id};
      `;
      if (!r.length) {
        return await db.sql`
          INSERT INTO level
          (server_id, member_id, member_level, xp) VALUES
          (${message.guild.id}, ${message.author.id}, 0, ${BigInt(utils.getRandomValue(20, 40))});
        `;
      }
      var { server_id, member_id, member_level, xp } = r[0];
      member_level = Number(member_level);

      let max = BigInt(3*member_level**2+50*member_level+100);
      xp += BigInt(utils.getRandomValue(20, 40));
      if (xp >= max) {
        if(!member_level) member_level = 0;
        member_level += 1;
        xp -= max;
        message.channel.send({ content: `${message.author.tag} levelled up to level ${member_level}. <:CheemsPrayDorime:869938135725903913>` });
      }

      return await db.sql`
        UPDATE level SET
        member_level = ${member_level},
        xp = ${xp}
        WHERE
        server_id = ${message.guild.id} AND member_id = ${message.author.id};
      `;
    }
  }
}
