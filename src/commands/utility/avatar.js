const Discord = require("discord.js");
const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    let target = user;
    if (await options.get("user")) {
      target = await options.getUser("user");
    }
    const avatarEmbed = new Discord.MessageEmbed()
      .setAuthor(target.tag, target.displayAvatarURL({dynamic: true}))
      .setTitle("Avatar")
      .setImage(target.displayAvatarURL({size: 512, dynamic: true}))
      .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
    return interaction.editReply({ embeds: [avatarEmbed] })
  },
  {
    name: 'avatar',
    category: "Utility",
    description: "Displays an user's avatar",
    cooldown: 3,
    options: [{
      name: 'user',
      type: 'USER',
      description: 'The user to get avatar of',
      required: false,
    }],
    perms: ["EMBED_LINKS"]
  }
)
