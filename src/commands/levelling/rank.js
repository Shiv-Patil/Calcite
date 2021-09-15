const Discord = require("discord.js");
const db = require('../../db/db');
const utils = require('../../utils/canvas.js');
const Canvas = require('canvas');
const GenericCommand = require('../../models/GenericCommand');

const getCard = async (target, level, rank, xp, max_xp) => {
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
  let discrim_lbl = `#${target.discriminator}`;
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
  grd.addColorStop(0, "#907fa4");
  grd.addColorStop(xp/max_xp, "#907fa4");
  grd.addColorStop(xp/max_xp+0.005, "#4b4d4d");
  grd.addColorStop(1, "#4b4d4d");
  ctx.fillStyle = grd;
  ctx.strokeStyle = "#000000";
  utils.roundRect(ctx, 300, canvas.height-140, 515, 40, 20, true, true);

  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = '#ffffff';
  ctx.font = '23px sans-serif';
  const wd_xp_left_lbl = ctx.measureText(xp_left_lbl).width;
  const wd_discrim_lbl = ctx.measureText(discrim_lbl).width;
  ctx.fillText(xp_left_lbl, canvas.width-50-(35+wd_xp_left_lbl), canvas.height-160);

  let lbl_username = target.username;
  lbl_username = utils.fillTextFit(canvas, ctx, lbl_username, 300, canvas.height-160, 490-wd_discrim_lbl-wd_xp_left_lbl, 32, 26);
  let wd_username_lbl = ctx.measureText(lbl_username).width;

  ctx.font = '23px sans-serif';
  ctx.fillText(discrim_lbl, 310+wd_username_lbl, canvas.height-160);

  ctx.beginPath();
  ctx.arc(175, 175, 90, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(target.displayAvatarURL({ format: 'jpg' }));
  ctx.drawImage(avatar, 85, 85, 180, 180);

  return canvas.toBuffer();
}

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    let target = user;
    if (await options.get("user")) {
      target = await options.getUser("user");
    }

    let r = Array.from(await db.sql`
      WITH ranks AS (
        SELECT *
        FROM level
        WHERE server_id = ${interaction.guild.id}
        ORDER BY member_level DESC, xp DESC
      ),
      ordered(member_level, xp, member_id, row_number) AS (
        SELECT member_level, xp, member_id, row_number() over()
        FROM ranks
      )
      SELECT *
      FROM ordered
      WHERE ordered.member_id = ${target.id};
    `);

    if (target.bot) {
      return interaction.editReply({ content: "Bots don't have levels <:CheemsPrayDorime:869938135725903913>" });
    }

    if (!r.length) {
      if (target == interaction.author) return interaction.editReply({ content: "You don't have a level yet! Send messages to get a level." });
      return interaction.editReply({ content: "That person doesn't have a level yet." });
    }

    let { member_level, xp, member_id, row_number } = r[0];
    member_level = Number(member_level);
    xp = Number(xp);
    const attachment = new Discord.MessageAttachment(
      await getCard(
        target, `${member_level}`, `${row_number}`, xp, 3*member_level**2+50*member_level+100
      ), 'rank_card.png');
    return interaction.editReply({ files: [attachment] });
  },
  {
    name: 'rank',
    aliases: ['rank', 'level'],
    category: "Levelling",
    description: "Shows your rank and level",
    cooldown: 10,
    options: [{
      name: 'user',
      type: 'USER',
      description: 'The user to get rank of',
      required: false,
    }],
  }
)
