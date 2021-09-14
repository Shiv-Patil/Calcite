const db = require('../db/db');
const Discord = require("discord.js");
const on_command = require("../custom_events/onCommand.js")

module.exports = {
  name: 'interactionCreate',
  async execute (client, interaction) {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;
    return await on_command.execute(client, interaction);
  }
};