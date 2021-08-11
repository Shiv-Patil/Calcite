const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MEMBERS
  ],
  allowedMentions: { repliedUser: false }
});
const { join } = require("path");
const fs = require("fs");
require('dotenv').config();
const pg = require('postgres');
const sql = pg(process.env.DATABASE_URL, {idle_timeout: 10, max: 5, types: {
  bigint: {
    to: 20,
    from: [20],
    parse: data => BigInt(data),
    serialize: bigint => bigint.toString()
  },
  inventory_item: {
    to        : 1337,
    from      : [1337],
    parse     : ([name, quantity]) => { name, quantity },
    serialize : ({ name, quantity }) => [name, quantity]
  }
}});
const db = require(join(__dirname, "db", "db"));
db.init(sql);

const eventFiles = fs.readdirSync(join(__dirname, "events")).filter(file => file.endsWith('.js'));

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync(join(__dirname, "commands"));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(join(__dirname, "commands", `${folder}`)).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${folder}`, `${file}`));
    client.commands.set(command.name, command);
  }
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, async (...args) => await event.execute(client, ...args));
  } else {
    client.on(event.name, async (...args) => await event.execute(client, ...args));
  }
}

client.login(process.env.CLIENT_TOKEN);
