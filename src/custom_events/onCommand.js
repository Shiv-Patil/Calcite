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

    try {
      await interaction.deferReply();
      await command.execute(interaction, interaction.options, client, interaction.user);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};
