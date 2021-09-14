const db = require('../../db/db');
const Discord = require("discord.js");
const utils = require('../../utils/math.js');
const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    var calcite = await db.get_user_calcite(user.id);
    let freeCalcite = BigInt(utils.getRandomValue(69, 420));
    calcite += freeCalcite;
    db.set_user_calcite(user.id, calcite);
    const balanceEmbed = new Discord.MessageEmbed()
      .setTitle('Free calcite')
      .setDescription(`Here, take ${freeCalcite} calcite.`)
    return await interaction.editReply({ embeds: [balanceEmbed] });
  },
  {
    name: 'free',
    aliases: ['free', 'beg'],
    category: "Currency",
    description: "Gives free calcite",
    cooldown: 40,
    perms: ["EMBED_LINKS"]
  }
)
