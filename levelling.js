const { join } = require("path");
const db = require(join(__dirname, "db", "db"));

function getRandomXp() {
  return Math.round(Math.random()*20+20)
}

module.exports = {
  async on_msg(message) {
    let r = Array.from(await db.sql`
      SELECT * FROM level
      WHERE server_id=${message.guild.id}
      AND member_id=${message.author.id};
    `);
    if (!r.length) {
      return await db.sql`
        INSERT INTO level
        (server_id, member_id, level, xp, lastmsg) VALUES
        (${message.guild.id}, ${message.author.id}, 0, ${getRandomXp()}, ${message.createdTimestamp});
      `;
    }
    var { server_id, member_id, level, xp, lastmsg } = r[0];
    if ((message.createdTimestamp - lastmsg) >= 60000) {
      let max = 3*level**2+50*level+100;
      xp += getRandomXp();
      if (xp>=max) {
        level += 1;
        xp -= max;
        message.channel.send(`${message.author.tag} levelled up to level ${level}. <:CheemsPrayDorime:869938135725903913>`);
      }
      return await db.sql`
        UPDATE level SET
        level = ${level},
        xp = ${xp},
        lastmsg = ${message.createdTimestamp}
        WHERE
        server_id = ${message.guild.id} AND member_id = ${message.author.id};
      `;
    }
  }
}