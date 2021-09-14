const GenericCommand = require('../../models/GenericCommand');
const db = require('../../db/db');
const Discord = require("discord.js");

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    let target = user;
    if (await options.get("user")) {
      target = await options.getUser("user");
    }
    var calcite = await db.get_user_calcite(target.id);
    const balanceEmbed = new Discord.MessageEmbed()
      .setTitle('Balance')
      .setDescription(`Calcite: ${calcite}`)
      .setFooter(target.tag, target.displayAvatarURL({dynamic: true}));
    return interaction.editReply({ embeds: [balanceEmbed] });
  },
  {
    name: 'balance',
    category: "Currency",
    description: "Shows your balance",
    cooldown: 3,
    options: [{
      name: 'user',
      type: 'USER',
      description: 'The user to get balance of',
      required: false,
    }],
    perms: ["EMBED_LINKS"]
  }
)
