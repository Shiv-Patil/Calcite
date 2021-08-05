const Discord = require("discord.js");
const db = require('../../db/db');
const Canvas = require('canvas');

const fillTextFit = (canvas, ctx, text, x, y, max_width=200, fontSize=34, minFontSize=34) => {
  do {
    if (fontSize <= minFontSize) {
      while (ctx.measureText(text).width > max_width) {
        text = text.slice(0,-1);
      }
      break;
    }
    ctx.font = `${fontSize--}px sans-serif`;
  } while (ctx.measureText(text).width > max_width);
  ctx.fillText(text, x, y);
  return text;
};

const getLevelsCard = async (memberList, client) => {
  const canvas = Canvas.createCanvas(600, 1000);
  const ctx = canvas.getContext('2d');
  const padding = 10;
  ctx.textBaseline = "middle";
  var user;
  for (var i = 0; i < memberList.length; i++) {
    let { member_level, member_id, row_number } = memberList[i];
    try {
      user = await client.users.fetch(member_id);
    } catch (error) {
      console.log(error);
      continue;
    }
    let y_level = (i!=0) ? i*(90+padding) : 0;
    ctx.fillStyle = "rgba(0, 0, 0, .75)";
    ctx.fillRect(0, y_level, 600, 90);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpg' }));
    ctx.drawImage(avatar, 0, y_level, 90, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '34px sans-serif';
    let level_lbl = `LVL: ${member_level}`
    let wd_level_lbl = ctx.measureText(level_lbl).width;
    ctx.fillText(level_lbl, canvas.width-10-wd_level_lbl, y_level+45);

    let rank_lbl = `#${row_number}`
    let wd_rank_lbl = ctx.measureText(rank_lbl).width;
    ctx.fillText(rank_lbl, 100, y_level+45);

    fillTextFit(canvas, ctx, user.tag, 110+wd_rank_lbl, y_level+45, canvas.width-(140+wd_rank_lbl+wd_level_lbl));
  }
  return canvas.toBuffer();
}

module.exports = {
  name: 'levels',
  aliases: ['levels', 'lb', 'leaderboard'],
  category: "Levelling",
  description: "Shows server leaderboard",
  cooldown: 30,
  async execute (message, args, client) {
    if (args) {
      message.editReply = message.reply;
    }
    const user = message.author || message.user;
    let r = await db.sql`
      WITH ranks AS (
        SELECT *
        FROM level
        WHERE server_id = ${message.guild.id}
        ORDER BY member_level DESC, xp DESC
      ),
      ordered(member_level, member_id, row_number) AS (
        SELECT member_level, member_id, row_number() over()
        FROM ranks
      )
      SELECT *
      FROM ordered LIMIT 10;
    `;
    const levelsEmbed = new Discord.MessageEmbed()
      .setTitle('Leaderboard')
      .setDescription(`Top 10 ranks in ${message.guild.name}`)
      .setImage('attachment://levels_card.png')
      .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
    const attachment = new Discord.MessageAttachment(
      await getLevelsCard(
        r, client
      ), 'levels_card.png');
    return message.editReply({ embeds: [levelsEmbed], files: [attachment] });
  }
}
