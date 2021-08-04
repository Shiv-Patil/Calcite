const Discord = require("discord.js");
const db = require('../../db/db');
const Canvas = require('canvas');
const { join } = require("path");

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }  
}

const fillTextFit = (canvas, ctx, text, x, y, max_width=200, fontSize=32) => {
  do {
    if (fontSize <= 26) {
      while (ctx.measureText(text).width > max_width) {
        text = text.slice(0,-1);
      }
      break;
    }
    ctx.font = `${fontSize--}px sans-serif`;
  } while (ctx.measureText(text).width > max_width);
  ctx.fillText(text, 300, canvas.height-160);
  return text;
};

const getCard = async (user, level, rank, xp, max_xp) => {
  const canvas = Canvas.createCanvas(900, 350);
  const ctx = canvas.getContext('2d');
  const bg = await Canvas.loadImage("https://picsum.photos/900/350");
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, .75)";
  ctx.fillRect(50, 50, 800, 250);

  ctx.font = '23px sans-serif';
  const wd_level_lbl = ctx.measureText("LEVEL").width;
  const wd_rank_lbl = ctx.measureText("RANK").width;
  let xp_lbl = (xp > 999) ? `${+((xp/1000).toFixed(2))}K` : `${xp}`;
  let max_xp_lbl = (max_xp > 999) ? `${+((max_xp/1000).toFixed(2))}K` : `${max_xp}`;
  let xp_left_lbl = `${xp_lbl} / ${max_xp_lbl} XP`;
  let discrim_lbl = `#${user.discriminator}`;
  ctx.font = '41px sans-serif';
  const wd_level = ctx.measureText(level).width;
  const wd_rank = ctx.measureText(rank).width;

  ctx.fillStyle = '#ffffff';
  ctx.fillText(level, canvas.width-50-(35+wd_level), 123);
  ctx.fillText(rank, canvas.width-50-(65+wd_level+wd_level_lbl+wd_rank), 123);

  ctx.font = '20px sans-serif';
  ctx.fillText("LEVEL", canvas.width-50-(38+wd_level+wd_level_lbl), 123);
  ctx.fillText("RANK", canvas.width-50-(68+wd_level+wd_level_lbl+wd_rank+wd_rank_lbl), 123);

  var grd = ctx.createLinearGradient(300, 0, 825, 0);
  grd.addColorStop(0, "#27c9d8");
  grd.addColorStop(xp/max_xp, "#27c9d8");
  grd.addColorStop(xp/max_xp+0.005, "#6b6d6d");
  grd.addColorStop(1, "#6b6d6d");
  ctx.fillStyle = grd;
  ctx.strokeStyle = "#000000";
  roundRect(ctx, 300, canvas.height-140, 515, 40, 20, true, true);

  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = '#ffffff';
  ctx.font = '23px sans-serif';
  const wd_xp_left_lbl = ctx.measureText(xp_left_lbl).width;
  const wd_discrim_lbl = ctx.measureText(discrim_lbl).width;
  ctx.fillText(xp_left_lbl, canvas.width-50-(35+wd_xp_left_lbl), canvas.height-160);

  let lbl_username = user.username;
  lbl_username = fillTextFit(canvas, ctx, lbl_username, 300, canvas.height-160, 490-wd_discrim_lbl-wd_xp_left_lbl);
  let wd_username_lbl = ctx.measureText(lbl_username).width;

  ctx.font = '23px sans-serif';
  ctx.fillText(discrim_lbl, 310+wd_username_lbl, canvas.height-160);

  ctx.beginPath();
  ctx.arc(175, 175, 90, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpg' }));
  ctx.drawImage(avatar, 85, 85, 180, 180);

  return canvas.toBuffer();
}

module.exports = {
  name: 'rank',
  aliases: ['rank', 'level'],
  category: "Levelling",
  description: "Shows your rank and level",
  cooldown: 10,
  async execute (message, args, client) {
    if (args.length > 1) return message.reply("this command accepts a maximum of 1 argument");
    let user = message.author;
    if (args.length) {
      let mentionID = args[0].trim().match(/^<@!?(\d+)>$/);
      if (!mentionID) mentionID = args[0].trim();
      else {mentionID = mentionID[1];}
      try {
        user = await client.users.fetch(mentionID);
      } catch (error) {
        
      }
    }

    let r = Array.from(await db.sql`
      WITH ranks AS (
        SELECT *
        FROM level
        WHERE server_id = ${message.guild.id}
        ORDER BY member_level DESC, xp DESC
      ),
      ordered(member_level, xp, member_id, row_number) AS (
        SELECT member_level, xp, member_id, row_number() over()
        FROM ranks
      )
      SELECT *
      FROM ordered
      WHERE ordered.member_id = ${user.id};
    `);
    console.log(r);

    if (user.bot) {
      return message.reply("Bots don't have levels <:CheemsPrayDorime:869938135725903913>");
    }

    if (!r.length) {
      if (user == message.author) return message.reply("You don't have a level yet! Send messages to get a level.");
      return message.reply("That person doesn't have a level yet.")
    }

    const { member_level, xp, member_id, row_number } = r[0];
    const attachment = new Discord.MessageAttachment(
      await getCard(
        user, `${member_level}`, `${row_number}`, xp, 3*member_level**2+50*member_level+100
      ), 'rank_card.png');
    return message.channel.send(attachment);
  }
}
