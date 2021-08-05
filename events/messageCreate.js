const db = require('../db/db');
const Discord = require("discord.js");
const levelling = require("../levelling");
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  name: 'messageCreate',
  async execute (client, message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.content === 'calcite deploy guild commands' && message.author.id === "398061543373406208") {
      const cmd_data = client.commands.map(({ execute, ...data }) => data);
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.guilds.cache.get('847436129254113300')?.commands.set(cmd_data);
    }
    else if (message.content === 'calcite delete guild commands' && message.author.id === "398061543373406208") {
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.guilds.cache.get('847436129254113300')?.commands.set([]);
    }
    else if (message.content === 'calcite deploy global commands' && message.author.id === "398061543373406208") {
      const cmd_data = client.commands.map(({ execute, ...data }) => data);
      message.react("<:CheemsPrayDorime:869938135725903913>")
      return await client.application?.commands.set(cmd_data);
    }
    let prefix = await db.fetch_prefix(message.guild.id);

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content.toLowerCase())) {
      return await levelling.on_msg(message);
    }

    const [, matchedPrefix] = message.content.toLowerCase().match(prefixRegex);

    const args = Array.from(
        message.content.slice(matchedPrefix.length)
        .trim()
        .matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+/g)
      ).map(x => x[1] || x[2] || x[0]);

    if (!args.length) {
      if (Array.from(message.mentions.users).length) return message.reply({
        content: `My prefix here is \`${prefix}\` <:mhml:847464650043555880>`
      });
      return;
    }

    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (cooldownAmount) {

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(
            { content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
            ephemeral: true }
          );
        }
      }
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
};