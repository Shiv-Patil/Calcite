const Discord = require("discord.js");
const config = require('./config.json');
const client = new Discord.Client();
const { join } = require("path");
const fs = require("fs");

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
})

const commandFiles = fs.readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content === `<@!${client.user.id}>`) return message.reply(`my prefix here is \`${config.prefix}\` <:mhml:847464650043555880>`);

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.prefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = Array.from(
      message.content.slice(matchedPrefix.length)
      .trim()
      .matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+/g)
    ).map(x => x[1] || x[2] || x[0]);

  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args, config);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.").catch(console.error);
  }
});

client.login(config.token);
