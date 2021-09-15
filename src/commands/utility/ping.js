const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    return interaction.editReply({ content: `Pong! ${Date.now() - interaction.createdTimestamp} ms.` });
  },
  {
    name: 'ping',
    aliases: ['ping'],
    category: "Utility",
    description: "Pong",
    cooldown: 3
  }
)
