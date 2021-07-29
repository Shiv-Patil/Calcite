const Discord = require("discord.js");

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (message.content === '!ping') {
		message.channel.send('Pong.');
	}
});

client.login('ODcwMzAwNTc3NTgwNTg1MDEw.YQKwkw.EO0C9hIldSxNZpba6y0S2GLGGgc');
