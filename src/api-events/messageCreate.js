const db = require('../db/db');
const Discord = require("discord.js");
const levelling = require("../levelling");

module.exports = {
  name: 'messageCreate',
  async execute (client, message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.content === 'calcite deploy guild commands' && message.author.id === "398061543373406208") {
      const cmd_data = client.commands.map((cls) => cls.props);
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.guilds.cache.get('847436129254113300')?.commands.set(cmd_data);
    }
    else if (message.content === 'calcite delete guild commands' && message.author.id === "398061543373406208") {
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.guilds.cache.get('847436129254113300')?.commands.set([]);
    }
    else if (message.content === 'calcite deploy global commands' && message.author.id === "398061543373406208") {
      const cmd_data = client.commands.map((cls) => cls.props);
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.application?.commands.set(cmd_data);
    }
    else if (message.content === 'calcite delete global commands' && message.author.id === "398061543373406208") {
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.application?.commands.set([]);
    }
    await levelling.on_msg(client, message);
  }
};