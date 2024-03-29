const Discord = require("discord.js");
const GenericCommand = require('../../models/GenericCommand');

const letter_dic = {
  '$': '  _  \n | | \n/ __)\n\\__ \\\n(   /\n |_| \n',
  '(': '  __\n / /\n| | \n| | \n| | \n \\_\\\n',
  ',': '   \n   \n   \n _ \n( )\n|/ \n',
  '0': '  ___  \n / _ \\ \n| | | |\n| |_| |\n \\___/ \n       \n',
  '4': ' _  _   \n| || |  \n| || |_ \n|__   _|\n   |_|  \n        \n',
  '8': '  ___  \n ( _ ) \n / _ \\ \n| (_) |\n \\___/ \n       \n',
  '<': '  __\n / /\n/ / \n\\ \\ \n \\_\\\n    \n',
  '@': '   ____  \n  / __ \\ \n / / _` |\n| | (_| |\n \\ \\__,_|\n  \\____/ \n',
  'D': ' ____  \n|  _ \\ \n| | | |\n| |_| |\n|____/ \n       \n',
  'H': ' _   _ \n| | | |\n| |_| |\n|  _  |\n|_| |_|\n       \n',
  'L': ' _     \n| |    \n| |    \n| |___ \n|_____|\n       \n',
  'P': ' ____  \n|  _ \\ \n| |_) |\n|  __/ \n|_|    \n       \n',
  'T': ' _____ \n|_   _|\n  | |  \n  | |  \n  |_|  \n       \n',
  'X': '__  __\n\\ \\/ /\n \\  / \n /  \\ \n/_/\\_\\\n      \n',
  '\\': '__    \n\\ \\   \n \\ \\  \n  \\ \\ \n   \\_\\\n      \n',
  '`': ' _ \n( )\n \\|\n   \n   \n   \n',
  'd': '     _ \n  __| |\n / _` |\n| (_| |\n \\__,_|\n       \n',
  'h': " _     \n| |__  \n| '_ \\ \n| | | |\n|_| |_|\n       \n",
  'l': ' _ \n| |\n| |\n| |\n|_|\n   \n',
  'p': "       \n _ __  \n| '_ \\ \n| |_) |\n| .__/ \n|_|    \n",
  't': ' _   \n| |_ \n| __|\n| |_ \n \\__|\n     \n',
  'x': '      \n__  __\n\\ \\/ /\n >  < \n/_/\\_\\\n      \n',
  '|': ' _ \n| |\n| |\n| |\n| |\n|_|\n',
  '#': '   _  _   \n _| || |_ \n|_  ..  _|\n|_      _|\n  |_||_|  \n          \n',
  "'": ' _ \n( )\n|/ \n   \n   \n   \n',
  '+': '       \n   _   \n _| |_ \n|_   _|\n  |_|  \n       \n',
  '/': '    __\n   / /\n  / / \n / /  \n/_/   \n      \n',
  '3': ' _____ \n|___ / \n  |_ \\ \n ___) |\n|____/ \n       \n',
  '7': ' _____ \n|___  |\n   / / \n  / /  \n /_/   \n       \n',
  ';': '   \n _ \n(_)\n _ \n( )\n|/ \n',
  '?': ' ___ \n|__ \\\n  / /\n |_| \n (_) \n     \n',
  'C': '  ____ \n / ___|\n| |    \n| |___ \n \\____|\n       \n',
  'G': '  ____ \n / ___|\n| |  _ \n| |_| |\n \\____|\n       \n',
  'K': " _  __\n| |/ /\n| ' / \n| . \\ \n|_|\\_\\\n      \n",
  'O': '  ___  \n / _ \\ \n| | | |\n| |_| |\n \\___/ \n       \n',
  'S': ' ____  \n/ ___| \n\\___ \\ \n ___) |\n|____/ \n       \n',
  'W': '__        __\n\\ \\      / /\n \\ \\ /\\ / / \n  \\ V  V /  \n   \\_/\\_/   \n            \n',
  '[': ' __ \n| _|\n| | \n| | \n| | \n|__|\n',
  '_': '       \n       \n       \n       \n _____ \n|_____|\n',
  'c': '      \n  ___ \n / __|\n| (__ \n \\___|\n      \n',
  'g': '       \n  __ _ \n / _` |\n| (_| |\n \\__, |\n |___/ \n',
  'k': ' _    \n| | __\n| |/ /\n|   < \n|_|\\_\\\n      \n',
  'o': '       \n  ___  \n / _ \\ \n| (_) |\n \\___/ \n       \n',
  's': '     \n ___ \n/ __|\n\\__ \\\n|___/\n     \n',
  'w': '          \n__      __\n\\ \\ /\\ / /\n \\ V  V / \n  \\_/\\_/  \n          \n',
  '{': '   __\n  / /\n | | \n< <  \n | | \n  \\_\\\n',
  '"': ' _ _ \n( | )\n V V \n     \n     \n     \n',
  '&': '  ___   \n ( _ )  \n / _ \\/\\\n| (_>  <\n \\___/\\/\n        \n',
  '*': '      \n__/\\__\n\\    /\n/_  _\\\n  \\/  \n      \n',
  '.': '   \n   \n   \n _ \n(_)\n   \n',
  '2': ' ____  \n|___ \\ \n  __) |\n / __/ \n|_____|\n       \n',
  '6': "  __   \n / /_  \n| '_ \\ \n| (_) |\n \\___/ \n       \n",
  ':': '   \n _ \n(_)\n _ \n(_)\n   \n',
  '>': '__  \n\\ \\ \n \\ \\\n / /\n/_/ \n    \n',
  'B': ' ____  \n| __ ) \n|  _ \\ \n| |_) |\n|____/ \n       \n',
  'F': ' _____ \n|  ___|\n| |_   \n|  _|  \n|_|    \n       \n',
  'J': '     _ \n    | |\n _  | |\n| |_| |\n \\___/ \n       \n',
  'N': ' _   _ \n| \\ | |\n|  \\| |\n| |\\  |\n|_| \\_|\n       \n',
  'R': ' ____  \n|  _ \\ \n| |_) |\n|  _ < \n|_| \\_\\\n       \n',
  'V': '__     __\n\\ \\   / /\n \\ \\ / / \n  \\ V /  \n   \\_/   \n         \n',
  'Z': ' _____\n|__  /\n  / / \n / /_ \n/____|\n      \n',
  '^': ' /\\ \n|/\\|\n    \n    \n    \n    \n',
  'b': " _     \n| |__  \n| '_ \\ \n| |_) |\n|_.__/ \n       \n",
  'f': '  __ \n / _|\n| |_ \n|  _|\n|_|  \n     \n',
  'j': '   _ \n  (_)\n  | |\n  | |\n _/ |\n|__/ \n',
  'n': "       \n _ __  \n| '_ \\ \n| | | |\n|_| |_|\n       \n",
  'r': "      \n _ __ \n| '__|\n| |   \n|_|   \n      \n",
  'v': '       \n__   __\n\\ \\ / /\n \\ V / \n  \\_/  \n       \n',
  'z': '     \n ____\n|_  /\n / / \n/___|\n     \n',
  '~': ' /\\/|\n|/\\/ \n     \n     \n     \n     \n',
  '!': ' _ \n| |\n| |\n|_|\n(_)\n   \n',
  '%': ' _  __\n(_)/ /\n  / / \n / /_ \n/_/(_)\n      \n',
  ')': '__  \n\\ \\ \n | |\n | |\n | |\n/_/ \n',
  '-': '       \n       \n _____ \n|_____|\n       \n       \n',
  '1': ' _ \n/ |\n| |\n| |\n|_|\n   \n',
  '5': ' ____  \n| ___| \n|___ \\ \n ___) |\n|____/ \n       \n',
  '9': '  ___  \n / _ \\ \n| (_) |\n \\__, |\n   /_/ \n       \n',
  '=': '       \n _____ \n|_____|\n|_____|\n       \n       \n',
  'A': '    _    \n   / \\   \n  / _ \\  \n / ___ \\ \n/_/   \\_\\\n         \n',
  'E': ' _____ \n| ____|\n|  _|  \n| |___ \n|_____|\n       \n',
  'I': ' ___ \n|_ _|\n | | \n | | \n|___|\n     \n',
  'M': ' __  __ \n|  \\/  |\n| |\\/| |\n| |  | |\n|_|  |_|\n        \n',
  'Q': '  ___  \n / _ \\ \n| | | |\n| |_| |\n \\__\\_\\\n       \n',
  'U': ' _   _ \n| | | |\n| | | |\n| |_| |\n \\___/ \n       \n',
  'Y': '__   __\n\\ \\ / /\n \\ V / \n  | |  \n  |_|  \n       \n',
  ']': ' __ \n|_ |\n | |\n | |\n | |\n|__|\n',
  'a': '       \n  __ _ \n / _` |\n| (_| |\n \\__,_|\n       \n',
  'e': '      \n  ___ \n / _ \\\n|  __/\n \\___|\n      \n',
  'i': ' _ \n(_)\n| |\n| |\n|_|\n   \n',
  'm': "           \n _ __ ___  \n| '_ ` _ \\ \n| | | | | |\n|_| |_| |_|\n           \n",
  'q': '       \n  __ _ \n / _` |\n| (_| |\n \\__, |\n    |_|\n',
  'u': '       \n _   _ \n| | | |\n| |_| |\n \\__,_|\n       \n',
  'y': '       \n _   _ \n| | | |\n| |_| |\n \\__, |\n |___/ \n',
  '}': '__   \n\\ \\  \n | | \n  > >\n | | \n/_/  \n',
  " ": '  \n  \n  \n  \n  \n  \n'
}

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    let text = "Calcite";
    let result_list = [];
    let split_list = [];
  	if (await options.get("text")) text = await options.getString("text");

    if (text.length > 69) return interaction.editReply({ content: "try again with fewer characters." });

    for (let i = 0; i < text.length; i++) {
      if (!letter_dic[text[i]]) continue;
      split_list.push(letter_dic[text[i]].split("\n"));
    }
    for (let i = 0; i < (split_list[0].length); i++) {
      let temp = "";
      for (let j = 0; j < (split_list.length); j++) {
        temp += split_list[j][i];
      }
      result_list.push(temp);
    }

    let buf = Buffer.from(result_list.join("\n"), 'utf-8');
    const attachment = new Discord.MessageAttachment(buf, user.tag+'_ascii.txt');
    interaction.editReply({ files: [attachment] });
  },
  {
    name: 'ascii',
    aliases: ['ascii'],
    category: "Fun",
    description: "Decorates plain text in ascii style",
    cooldown: 10,
    options: [{
      name: 'text',
      type: 'STRING',
      description: 'Text to decorate',
      required: false,
    }],
    perms: ["ATTACH_FILES"]
  }
)
