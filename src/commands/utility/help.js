const db = require('../../db/db');
const { MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed } = require('discord.js');
const GenericCommand = require('../../models/GenericCommand');

function HelpEmbed(user, title, description, page, pages) {
  return new MessageEmbed()
    .setTitle(title)
    .setDescription(description += `\n\nPage ${page} of ${pages}`)
    .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
}

function getHelpString(cmd_array, page) {
  let _temp_string = "";
  let _temp_array = [];
  for (var i = cmd_array.length - 1; i >= 0; i--) {
    _temp_string += `<:ReplyOne:874501963893588019>[${cmd_array[i].name}](https://umm.nothing.here)
<:ReplyTwo:874502020554432543><:ReplyThree:874502075004907580>*${cmd_array[i].description}*`;
    if (_temp_string.length > 1100) {
      _temp_array.push(_temp_string);
      _temp_string = "";
      continue
    }
    if (i) _temp_string += "\n";
  }
  if (_temp_string !== "") _temp_array.push(_temp_string);
  if (page > _temp_array.length) return [_temp_array[_temp_array.length-1], _temp_array.length, _temp_array.length];
  else if (page < 1) return [_temp_array[0], 1, _temp_array.length];
  return [_temp_array[page-1], page, _temp_array.length];
}

function resolveArray(string, GeneralCommands, LevellingCommands, CurrencyCommands, FunCommands, AllCommands) {
  switch (string) {
    case 'utility':
      return ["General Commands", GeneralCommands];
      break;
    case 'levelling':
      return ["Levelling Commands", LevellingCommands];
      break;
    case 'currency':
      return ["Currency Commands", CurrencyCommands];
      break;
    case 'fun':
      return ["Fun Commands", FunCommands];
      break;
  }
  return ["All Commands", AllCommands];
}

module.exports = new GenericCommand(
  async (interaction, options, client, user) => {
    const AllCommands=[], CurrencyCommands=[], FunCommands=[], LevellingCommands=[], GeneralCommands=[];
    const sortedCommands = Array.from(client.commands.values()).sort((a, b) => (a.props.name > b.props.name) ? -1 : 1);
    sortedCommands.forEach(cmd => {
      let _details = { name: cmd.props.name, description: cmd.props.description };
      AllCommands.push(_details);
      resolveArray(cmd.props.category.toLowerCase(), GeneralCommands, LevellingCommands, CurrencyCommands, FunCommands, AllCommands)[1].push(_details);
    })
    var selectedArray = AllCommands, title = "All Commands";
    var [description, page, pages] = getHelpString(selectedArray, 1);
    var embed = HelpEmbed(user, title, description, page, pages);
    const row1 = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('select')
          .addOptions([
            {
              label: 'All commands',
              value: 'all'
            },
            {
              label: 'General commands',
              value: 'utility'
            },
            {
              label: 'Levelling commands',
              value: 'levelling'
            },
            {
              label: 'Currency commands',
              value: 'currency'
            },
            {
              label: 'Fun commands',
              value: 'fun'
            },
          ]),
      );
    const row2 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('previous')
          .setLabel('Previous page')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('next')
          .setLabel('Next page')
          .setStyle('SECONDARY')
      );
    const sentMessage = await interaction.editReply({ embeds: [embed], components: [row1, row2] });

    const collector = sentMessage.createMessageComponentCollector({ idle: 20000, dispose: true });
  
    collector.on('collect', async i => {
      if (i.user.id !== user.id) return i.reply({ content: `These options aren't for you!`, ephemeral: true });
      switch (i.customId) {
        case "previous":
          [description, page, pages] = getHelpString(selectedArray, --page);
          var embed = HelpEmbed(user, title, description, page, pages);
          i.update({ embeds: [embed] });
          break;
        case "next":
          [description, page, pages] = getHelpString(selectedArray, ++page);
          var embed = HelpEmbed(user, title, description, page, pages);
          i.update({ embeds: [embed] });
          break;
        case "select":
          [title, selectedArray] = resolveArray(i.values[0], GeneralCommands, LevellingCommands, CurrencyCommands, FunCommands, AllCommands);
          [description, page, pages] = getHelpString(selectedArray, 1);
          var embed = HelpEmbed(user, title, description, page, pages);
          i.update({ embeds: [embed] });
          break;
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason==="messageDelete") return;
      if (sentMessage.editable) sentMessage.edit({ components: [] });
    });
  },
  {
    name: 'help',
    category: "Utility",
    description: "Lists commands",
    cooldown: 5,
    perms: ["EMBED_LINKS"]
  }
)
