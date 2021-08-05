const db = require('../db/db');
const Discord = require("discord.js");

module.exports = {
  name: 'interactionCreate',
  async execute (client, interaction) {
    if (interaction.isButton()) {
      const [ cmdName, button, author ] = interaction.customId.split(',')
      const command = client.commands.get(cmdName);
      if (!command) return;
      if (interaction.user.id != author) {
        return await interaction.reply({
          content: 'This menu is not for you.',
          ephemeral: true
        });
      }
      try {
        return await command.onButton(interaction, button, client);
      } catch (error) {
        console.error(error);
        return await interaction.reply({ content: 'There was an error while processing the button press!', ephemeral: true });
      }
    }
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;

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

    if (cooldownAmount) {

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
      await interaction.defer();
      await command.execute(interaction, undefined, client);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};