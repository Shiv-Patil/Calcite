const db = require('../../db/db');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const utils = require('../../utils');

const cardTypes = ["♦", "♥", "♣", "♠"];
const cardNums = {
  "A": 11, "2": 2, "3": 3, "4": 4,
  "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10
};

function getCard() {
  let num = Object.keys(cardNums)[Math.floor(Math.random()*13)];
  let value = cardNums[num];
  return [`${cardTypes[Math.floor(Math.random()*4)]} ${num}`, value];
}

function getDeckValue(deck) {
  return deck.reduce(
    function (accumVariable, item) {
      return accumVariable + item.value;
    }, 0
  )
}

function drawCard(deck) {
  let [ _card, _value ] = getCard();
  deck.push({card: _card, value: _value});
  while (getDeckValue(deck) > 21) {
    let indexA = deck.findIndex(el => (el.card.slice(-1) === "A") && (el.value === 11));
    if (indexA != -1) {
      deck[indexA].value = 1;
    }
    else break;
  }
}

function playerHit(player_deck) {
  drawCard(player_deck);
  if (getDeckValue(player_deck) > 21) {
    return false; // player busted
  }
  else if (getDeckValue(player_deck) === 21) {
    return true; // player win
  }
  else {
    if (player_deck.length === 5) return true; // player win
    return null; // nothing interesting happened
  }
}

function playerStand(dealer_deck) {
  while (getDeckValue(dealer_deck) < 17) {
    drawCard(dealer_deck);
    if (getDeckValue(dealer_deck) > 21) {
      return false; // dealer busted
    }
    else if (getDeckValue(dealer_deck) === 21) {
      return true; // dealer win
    }
    else {
      if (dealer_deck.length === 5) return true;
    }
  }
  return null;
}

function getCardsString(deck, hide=false) {
  let CardsString = "Cards:";
  for (var i = 0; i < deck.length; i++) {
    CardsString += ` [\`${deck[i].card}\`](https://discord.gg/WV5XEqF87s)`;
    if (hide) {
      CardsString += ` [\`?\`](https://discord.gg/WV5XEqF87s)`;
      break;
    }
  }
  return CardsString;
}

function getDeckValueString(deck, hide=false) {
  return (hide) ? "Total: `?`" : `Total: \`${getDeckValue(deck)}\``;
}

function getFieldString(name, user, deck, hide=false) {
  return `**${user} (${name})**\n\n${getCardsString(deck, hide)}\n${getDeckValueString(deck, hide)}`;
}

function makeGameEmbed(user, client, player_deck, dealer_deck, hide=false, description,
  footer = "K, Q, J = 10  |  A = 1 or 11", color = "#907fa4"
  ) {
  return new MessageEmbed()
    .setColor(color)
    .setAuthor(`${user.username}'s blackjack game`, user.displayAvatarURL({dynamic: true}))
    .setDescription(description)
    .addField('\u200b', getFieldString("Player", user, player_deck), true)
    .addField('\u200b', getFieldString("Dealer", client.user, dealer_deck, hide), true)
    .setFooter(footer);
}

module.exports = {
  name: 'blackjack',
  aliases: ['blackjack', 'bj'],
  category: "Currency",
  description: "Play some blackjack! Bet some calcite or play for fun.",
  cooldown: 15,
  options: [{
    name: 'calcite',
    type: 'STRING',
    description: 'Amount of calcite to bet',
    required: false,
  }],
  async execute (message, args, client, user) {
    if (args.length > 1) return message.editReply({ content: "This command accepts a maximum of 1 argument" });
    var bet = null;
    var calcite;
    let r = await db.sql`SELECT calcite FROM currency WHERE member_id=${user.id};`
    if (!r.length) {
      calcite = BigInt(100);
      await db.currency_add_user(user.id, calcite)
    }
    else calcite = r[0].calcite;

    if (args.length) {
      args[0] = args[0].toLowerCase();
      if (["all", "max"].includes(args[0])) {
        bet = Math.min(Number(calcite), 5000);
      }
      else if (args[0] === "half") {
        bet = Math.min(Number(calcite)/2, 5000);
      }
      else {
        bet = parseFloat(args[0], 10);
        if (Number.isNaN(bet)) return message.editReply({ content: "You need to bet real calcite <:CheemsPrayDorime:869938135725903913>" });
        else if (!Number.isInteger(bet)) return message.editReply({ content: "Calcite can't be divided <:CheemsPrayDorime:869938135725903913>" });
      }
      bet = BigInt(bet);
      if (calcite < bet) return message.editReply({ content: "You ain't that rich <:CheemsVibe:869783586558079006>" });
      else if (bet > 5000) return message.editReply({ content: "You're too rich, maximum bet is 5000 calcite. <:CheemsVibe:869783586558079006>" });
      calcite -= bet;
      await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
    }
    
    let player_deck = [], dealer_deck = []
    for (var i = 1; i >= 0; i--) {
      drawCard(player_deck);
      drawCard(dealer_deck);
    }

    const component = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('hit')
          .setLabel('Hit')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('stand')
          .setLabel('Stand')
          .setStyle('PRIMARY')
      );

    const bet_description = (bet) ? "Your bet: "+bet.toString() : "Your bet: None";
    var gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, true, bet_description);
    var game_running = true;
    let sentMessage = await message.editReply({ embeds: [gameEmbed], components: [component] });

    const collector = sentMessage.createMessageComponentCollector({ componentType: 'BUTTON', idle: 20000, dispose: true });

    collector.on('collect', async i => {
      if (i.user.id === user.id) {
        i.deferUpdate();
        if (i.customId === "hit") {
          let result = playerHit(player_deck);
          if (result === true) {
            let winMsg;
            if (player_deck.length===5) winMsg="**You win! You drew 5 cards without going above 21!**";
            else winMsg="**You win! You hit 21!**";
            if (bet) {
              calcite += bet + bet;
              await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
              winMsg+=`\nYou won ${bet} calcite. You now have ${calcite}.`;
            }
            gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, winMsg, "Nice!", "#39ce3c");
            await sentMessage.edit({ components: [], embeds: [gameEmbed] });
            game_running = false;
            collector.stop();
          }
          else if (result === false) {
            let loseMsg="**You lost :( You went over 21 and busted.**";
            if (bet) {
              loseMsg+=`\nYou lost ${bet} calcite. You now have ${calcite}.`;
            }
            gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, loseMsg, "Better luck next time ):", "#ef5151");
            await sentMessage.edit({ components: [], embeds: [gameEmbed] });
            game_running = false;
            collector.stop();
          }
          else {
            gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, true, bet_description);
            await sentMessage.edit({ embeds: [gameEmbed] });
          }
        }
        else {
          let result = playerStand(dealer_deck);
          if (result === false) {
            let winMsg = "**You win! The dealer went over 21 and busted.**";
            if (bet) {
              calcite += bet + bet;
              await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
              winMsg+=`\nYou won ${bet} calcite. You now have ${calcite}.`;
            }
            gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, winMsg, "Nice!", "#39ce3c");
            await sentMessage.edit({ components: [], embeds: [gameEmbed] });
            game_running = false;
            collector.stop();
          }
          else if (result === true) {
            let loseMsg;
            if (dealer_deck.length===5) loseMsg="**You lost :( The dealer drew 5 cars without going above 21.**";
            else loseMsg="**You lost :( The dealer hit 21.**";
            if (bet) {
              loseMsg+=`\nYou lost ${bet} calcite. You now have ${calcite}.`;
            }
            gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, loseMsg, "Better luck next time ):", "#ef5151");
            await sentMessage.edit({ components: [], embeds: [gameEmbed] });
            game_running = false;
            collector.stop();
          }
          else {
            let player_deck_val = getDeckValue(player_deck), dealer_deck_val = getDeckValue(dealer_deck);
            if (player_deck_val > dealer_deck_val) {
              let winMsg = `**You win! You stood with a higher score (\`${player_deck_val}\`) than the dealer (\`${dealer_deck_val}\`).**`;
              if (bet) {
                calcite += bet + bet;
                await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
                winMsg+=`\nYou won ${bet} calcite. You now have ${calcite}.`;
              }
              gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, winMsg, "Nice!", "#39ce3c");
              await sentMessage.edit({ components: [], embeds: [gameEmbed] });
              game_running = false;
              collector.stop();
            }
            else if (player_deck_val < dealer_deck_val) {
              let loseMsg = `**You lost :( You stood with a lower score (\`${player_deck_val}\`) than the dealer (\`${dealer_deck_val}\`)**`;
              if (bet) {
                loseMsg+=`\nYou lost ${bet} calcite. You now have ${calcite}.`;
              }
              gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, loseMsg, "Better luck next time ):", "#ef5151");
              await sentMessage.edit({ components: [], embeds: [gameEmbed] });
              game_running = false;
              collector.stop();
            }
            else {
              let drawMsg = `**You tied with the dealer.**`;
              if (bet) {
                calcite += bet;
                await db.sql`UPDATE currency SET calcite=${calcite} WHERE member_id=${user.id}`;
                drawMsg+=`\nYour currency hasn't changed. You have ${calcite} calcite still.`;
              }
              gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, drawMsg, "Hate when this happens", "#e5b739");
              await sentMessage.edit({ components: [], embeds: [gameEmbed] });
              game_running = false;
              collector.stop();
            }
          }
        }
      } else {
        i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
      }
    });

    collector.on('end', async collected => {
      if (game_running) {
        idleMsg = "**You didn't respond in time.**";
        if (bet) {
          idleMsg+=`\nYou lost ${bet} calcite. You now have ${calcite}.`;
        }
        gameEmbed = makeGameEmbed(user, client, player_deck, dealer_deck, false, idleMsg, "c'mon man", "#e5b739");
        await sentMessage.edit({ components: [], embeds: [gameEmbed] });
      }
      else await sentMessage.edit({ components: [] });
    })
  }
}
