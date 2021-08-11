const Discord = require("discord.js");
const db = require('../../db/db');
const Canvas = require('canvas');
const utils = require('../../utils');

const getLevelsCard = async (memberList, client, guild) => {
  const canvas = Canvas.createCanvas(750, 810);
  const ctx = canvas.getContext('2d');
  const padding = 5;
  ctx.textBaseline = "middle";
  var guild_members = guild.members;
  var y_level_multi = 0;
  for (var i = 0; i < memberList.length; ++i) {
    if (!memberList[i]) break;
    var { member_level, member_id, row_number } = memberList[i];
    try {
      var member = (await guild_members.fetch(`${member_id}`)).user;
    } catch (error) {
      continue;
    }
    let y_level = y_level_multi*(76+padding);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, y_level, canvas.width, 90);
    const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'png' }));
    ctx.drawImage(avatar, 0, y_level, 81, 81);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    let level_lbl = `LVL: ${member_level}`
    let wd_level_lbl = ctx.measureText(level_lbl).width;
    ctx.fillText(level_lbl, canvas.width-10-wd_level_lbl, y_level+38);

    let rank_lbl = `#${y_level_multi+1}`
    let wd_rank_lbl = ctx.measureText(rank_lbl).width;
    ctx.fillText(rank_lbl, 100, y_level+38);

    utils.fillTextFit(canvas, ctx, member.tag, 110+wd_rank_lbl, y_level+38, canvas.width-(140+wd_rank_lbl+wd_level_lbl));
    y_level_multi++;
    if (i >= 10) break;
  }
  return canvas.toBuffer();
}

module.exports = {
  name: 'leaderboard',
  aliases: ['leaderboard', 'levels', 'lb'],
  category: "Levelling",
  description: "Shows server leaderboard",
  cooldown: 30,
  async execute (message, args, client, user) {
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
      FROM ordered;
    `;
    const levelsEmbed = new Discord.MessageEmbed()
      .setTitle('Leaderboard')
      .setDescription(`Top 10 ranks in ${message.guild.name}`)
      .setImage('attachment://levels_card.png')
      .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
    const attachment = new Discord.MessageAttachment(
      await getLevelsCard(
        r, client, message.guild
      ), 'levels_card.png');
    return message.editReply({ embeds: [levelsEmbed], files: [attachment] });
  }
}
