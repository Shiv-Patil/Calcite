const Discord = require("discord.js");

module.exports = {
  name: 'onCommand',
  async execute (client, interaction) {
    if (!interaction.guild.me.permissionsIn(interaction.channel).has(["SEND_MESSAGES", "VIEW_CHANNEL"])) {
      return interaction.reply({
        content: "I do not have permissions to view/send messages in this channel.",
        ephemeral: true
      });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return interaction.reply({ content: 'No such command exists! Weird...', ephemeral: true });

    if (!interaction.guild.me.permissionsIn(interaction.channel).has(command.props.perms)) {
      return interaction.reply({
        content: "I am missing required permissions to run that command.",
        ephemeral: true
      });
    }

    if (!client.cooldowns.has(interaction.commandName)) {
      client.cooldowns.set(interaction.commandName, new Discord.LimitedCollection({sweepInterval:3600, sweepFilter:function(coll){return function(){return true}}}));
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(interaction.commandName);
    const cooldownAmount = (command.props.cooldown || 0) * 1000;

    if (cooldownAmount && interaction.user.id!=398061543373406208) {

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply(
            { content: command.props.cdmessage(timeLeft.toFixed(1), interaction.commandName),
            ephemeral: true }
          );
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
      await interaction.deferReply();
      await command.run(interaction, interaction.options, client, interaction.user);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};
