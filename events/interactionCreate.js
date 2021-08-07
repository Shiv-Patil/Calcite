const db = require('../db/db');
const Discord = require("discord.js");

module.exports = {
  name: 'interactionCreate',
  async execute (client, interaction) {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;
    if (!interaction.guild.me.permissionsIn(interaction.channel).has(["SEND_MESSAGES", "VIEW_CHANNEL"])) {
      return interaction.reply({
        content: "I do not have permissions to send messages in this channel.",
        ephemeral: true
      });
    }

    const command =
      client.commands.get(interaction.commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.commandName));

    if (!command) return;

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (cooldownAmount && interaction.user.id!=398061543373406208) {

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply(
            { content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
              ephemeral: true }
          );
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
      await interaction.deferReply();
      await command.execute(interaction, interaction.options._hoistedOptions.map(({ value, ...etv }) => value), client, interaction.user);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};