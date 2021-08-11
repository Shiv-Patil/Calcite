const db = require('../../db/db');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const utils = require('../../utils');

function TransferEmbed(user, description, color="#907fa4") {
  return new MessageEmbed()
    .setColor(color)
    .setDescription(description)
    .setFooter(user.tag, user.displayAvatarURL({dynamic: true}));
}

module.exports = {
  name: 'transfer',
  aliases: ['transfer', 'give'],
  category: "Currency",
  description: "Transfers your calcite to another user",
  cooldown: 10,
  options: [
    {
      name: 'user',
      type: 'USER',
      description: 'The user to get balance of',
      required: true
    },
    {
      name: 'amount',
      type: 'STRING',
      description: 'Amount of calcite to transfer',
      required: true
    }
  ],
  async execute (message, args, client, user) {
    if (args.length > 2) return message.editReply({ content: "Syntax -> `transfer <user> <amount>`" });
    if (args.length < 2) return message.editReply({ content: "Syntax -> `transfer <user> <amount>`" });
    let target = await utils.parseMention(false, args[0], client);
    if (!target) return message.editReply({ content: "Please specify a valid user." });

    if (user.tag === target.tag) return message.editReply({ content: "Sending calcite to yourself, smh." });

    var calcite_user = await db.get_user_calcite(user.id);
    var calcite_target = await db.get_user_calcite(target.id);

    var transfer_amount = utils.parseCalciteString(calcite_user, args[1]);
    if (!transfer_amount || Number.isNaN(transfer_amount)) return message.editReply({ content: "You need to specify a valid amount of calcite to transfer <:CheemsPrayDorime:869938135725903913>" });
    if (calcite_user < transfer_amount) return message.editReply({ content: "You ain't that rich <:CheemsVibe:869783586558079006>" });

    let tax;

    if (transfer_amount < BigInt(1000)) tax = BigInt(0);
    else tax = (BigInt(69)*transfer_amount)/BigInt(1000);

    calcite_user -= transfer_amount;
    transfer_amount -= tax;
    calcite_target += transfer_amount;

    const component = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('yes')
          .setLabel('Yes')
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId('no')
          .setLabel('No')
          .setStyle('DANGER')
      );

    var sentMessage;
    var embed;

    if (tax) {
      embed = TransferEmbed(user, `Are you sure you want to give \`${transfer_amount}\` calcite to ${target} after \`6.9%\` tax?`)
      sentMessage = await message.editReply({ embeds: [embed], components:[component] });
    }
    else {
      embed = TransferEmbed(user, `Are you sure you want to give \`${transfer_amount}\` calcite to ${target}?`)
      sentMessage = await message.editReply({ embeds: [embed], components:[component] });
    }

    var transfer_done = false;
    const collector = sentMessage.createMessageComponentCollector({ componentType: 'BUTTON', idle: 10000, dispose: true });

    collector.on('collect', async i => {
      if (i.user.id === user.id) {
        i.deferUpdate();
        if (i.customId === "yes") {
          await db.set_user_calcite(user.id, calcite_user);
          await db.set_user_calcite(target.id, calcite_target);
          if (tax) {embed = new MessageEmbed(embed).setDescription(
            embed.description += `\n\n**You gave ${target} \`${transfer_amount}\` calcite after \`6.9%\` tax.
You now have \`${calcite_user}\` calcite left.**`
          );}
          else {embed = new MessageEmbed(embed).setDescription(
            embed.description += `\n\n**You gave ${target} \`${transfer_amount}\` calcite.
You now have \`${calcite_user}\` calcite left.**`
          );}
          transfer_done = true;
          sentMessage.edit({ embeds: [embed], components:[] });
          collector.stop();
        }
        else if (i.customId === "no") {
          embed = new MessageEmbed(embed).setDescription(
            embed.description += `\n\n**Transfer cancelled by user**`
          );
          transfer_done = true;
          sentMessage.edit({ embeds: [embed], components:[] });
          collector.stop();
        }
      } else {
        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason==="messageDelete") return;
      if (!transfer_done) {
        embed = new MessageEmbed(embed).setDescription(
          embed.description += `\n\n**User didn't respond in time.**`
        );
        return await sentMessage.edit({ embeds: [embed], components:[] });
      }
    });
  }
}
