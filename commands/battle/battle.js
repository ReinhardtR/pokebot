module.exports = {
  name: "battle",
  description: "Challenge a friend to a Pokémon-battle, and earn rewards!",
  args: true,
  usage: "<user-tag>",
  guildOnly: true,
  needProfile: true,
  async execute(msg, args) {
    if (!msg.mentions.members.size) {
      return msg.reply("you didn't mention a user.");
    }

    const invitedUser = msg.mentions.members.first().user;

    // if (invitedUser.id == msg.author.id) {
    //   return msg.reply("you can't battle yourself. Battle a friend instead!");
    // }

    const { battles } = msg.client;

    const alreadyInBattle = await battles.find(
      (battle) =>
        battle.player1 === msg.author.id ||
        battle.player2 === msg.author.id ||
        battle.player1 === invitedUser.id ||
        battle.player2 === invitedUser.id
    );

    if (alreadyInBattle) {
      return msg.reply("you or the user you invited are already in a battle.");
    }

    const { getUserProfile } = require("../../database");
    const invitedUserProfile = await getUserProfile(invitedUser.id);

    if (!invitedUserProfile) {
      return msg.reply(
        `${invitedUser.toString()} doesn't have a profile. Encourage him to create one!`
      );
    }

    if (!invitedUserProfile.team.length) {
      return msg.reply(
        "your opponent doesn't have a Pokémon-team. Use p!bag to make a team."
      );
    }

    const userProfile = await getUserProfile(msg.author.id);

    if (!userProfile.team.length) {
      return msg.reply(
        "you don't have a Pokémon-team. Use p!bag to make a team."
      );
    }

    const inviteEmbed = new Discord.MessageEmbed().setTitle(
      `${msg.author.username} challenged ${invitedUser.username}!`
    );

    const botInviteMsg = await msg.channel.send({ embed: inviteEmbed });

    await botInviteMsg.react("✅");
    await botInviteMsg.react("❌");

    const reactFilter = async (reaction, user) => {
      const validReaction = ["✅", "❌"].includes(reaction.emoji.name);
      const isInvitedUser = user.id === invitedUser.id;
      if (validReaction && isInvitedUser) {
        return true;
      } else {
        await reaction.users.remove(user.id);
        return false;
      }
    };

    botInviteMsg
      .awaitReactions(reactFilter, {
        max: 1,
        time: 20000,
        errors: ["Invitation time-out."],
      })
      .then((reactions) => {
        const reaction = reactions.first();
        if (reaction.emoji.name === "✅") {
          msg.reply(`${invitedUser.toString()} has accepted your battle!`);
          startBattle();
        } else {
          msg.reply(`${invitedUser.toString()} rejected your battle.`);
        }
        botInviteMsg.delete();
      })
      .catch((error) => {
        msg.reply(
          `${invitedUser.toString()} didn't react to your battle-invitation in time.`
        );
        botInviteMsg.delete();
      });

    const startBattle = async () => {
      const channel = await createChannel(msg, invitedUser);

      channel.send(`${msg.author} vs ${invitedUser.toString()}!`);

      const battle = {
        channel,
        player1: msg.author.id,
        player2: invitedUser.id,
        spectators: [],
      };

      battles.set(channel.id, battle);

      const { getTeam } = require("../../database");
      const player1Team = await getTeam(battle.player1);
      const player2Team = await getTeam(battle.player2);

      const player1 = {
        user: msg.author,
        team: player1Team,
        activePokemon: undefined,
      };

      const player2 = {
        user: invitedUser,
        team: player2Team,
        activePokemon: undefined,
      };

      const players = [player1, player2];

      await Promise.all(
        players.map(async (player, index) => {
          const pokemonsWithStats = await Promise.all(
            player.team.map(async (pokemon) => {
              return {
                ...pokemon,
                stats: await getPokemonStats(pokemon.id, 2), // GET POKEMON LEVEL FROM XP AND PASS IT HERE
              };
            })
          );

          player.team = pokemonsWithStats;
          player.activePokemon = player.team[0];
        })
      );

      // Preloaded images.
      const background = await Canvas.loadImage(
        "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/battleBackground.png"
      );
      const pokeball = await Canvas.loadImage(
        "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pokeball.png"
      );

      const embedTitle = `${msg.author.username} vs ${invitedUser.username}`;

      var currentPlayer = player1;

      const getMove = (suggestedMove, player) => {
        const moveNumber = parseInt(suggestedMove);
        if (!isNaN(moveNumber)) {
          return player.activePokemon.moves[moveNumber - 1];
        } else {
          const validMove = player.activePokemon.moves.find(
            ({ name }) => name == suggestedMove
          );

          if (validMove) return validMove;
        }
        return;
      };

      const executeMoveAndGetMsg = (move, player, opponent) => {
        var moveLanded = false;

        if (move.accuracy == 100) moveLanded = true;

        const randomNum = Math.floor(Math.random() * 100);
        if (move.accuracy < randomNum) moveLanded = true;

        const playerPokemonName = upperCaseString(player.activePokemon.name);
        if (moveLanded) {
          const attack = player.activePokemon.stats.attack;
          const defense = opponent.activePokemon.stats.defense;
          const effect = ((attack - defense) / 35) * move.power;
          const damage = Math.floor(move.power + effect);
          opponent.activePokemon.stats.hp -= damage;

          const opponentPokemonName = upperCaseString(
            opponent.activePokemon.name
          );

          return `${playerPokemonName} dealt **${damage} damage** to ${opponentPokemonName}`;
        } else {
          const moveName = upperCaseString(move.name);
          return `${playerPokemonName} **missed** ${moveName}!`;
        }
      };

      const msgFilter = (m) => {
        const usersTurn = m.author.id == currentPlayer.user.id;
        return usersTurn;
      };

      const continueBattle = async () => {
        const battleEmbed = getBattleEmbed(
          players,
          background,
          pokeball,
          embedTitle
        );

        console.log(channel);
        await channel.send({ embed: battleEmbed });

        console.log(channel);
        const collected = await channel.awaitMessages(msgFilter).catch((c) => {
          console.log(c);
          return channel.send(
            `${currentPlayer.user.toString()} forfeited the battle, by not choosing a move in time.`
          );
        });

        console.log(collected);
        if (!collected) return;
        const moveMsg = collected.first().content().toLowerCase();

        console.log(moveMsg);

        const move = getMove(moveMsg, currentPlayer);

        console.log(move);

        const opponent = currentPlayer == player1 ? player2 : player1;

        const feedbackMsg = executeMoveAndGetMsg(move, currentPlayer, opponent);

        console.log(feedbackMsg);

        channel.send(`${currentPlayer.user.toString()}, ${feedbackMsg}`);

        // if (player1.team.length && player2.team.length) {
        //   continueBattle();
        // } else {
        //   endBattle();
        // }
      };

      const endBattle = () => {};

      continueBattle();
    };
  },
};

const Discord = require("discord.js");
const Canvas = require("canvas");
const drawPokemonImage = require("../../utils/drawPokemonImage");
const upperCaseString = require("../../utils/upperCaseString");
const roundRect = require("../../utils/roundRect");
const getPokemonStyles = require("./utils/getPokemonStyles");
const getPokemonStats = require("./utils/getPokemonStats");

const getBattleEmbed = (players, background, pokeball, title) => {
  const canvas = Canvas.createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(background, 0, 0);

  const pokemonSize = 128;
  const pokemonStyles = getPokemonStyles(pokemonSize);
  const boxPadding = 12;

  players.forEach((player, index) => {
    // Get Styles for this player.
    const style = pokemonStyles[`player${index + 1}`];

    // Draw Pokemon.
    drawPokemonImage(
      ctx,
      player.activePokemon.id,
      style.pokemon.x,
      style.pokemon.y,
      style.pokemon.size,
      style.pokemon.showBack,
      style.pokemon.clipY
    );

    // Draw Box With Name and other info.
    // Create Canvas.
    const boxCanvas = Canvas.createCanvas(150, 60);
    const boxCtx = boxCanvas.getContext("2d");

    // Box Background.
    boxCtx.fillStyle = "rgb(24,24,24)";
    boxCtx.strokeStyle = "rgb(36,36,36)";
    roundRect(boxCtx, 0, 0, boxCanvas.width, boxCanvas.height, 16);

    // Pokemon Name.
    const textPos = {
      x: boxPadding,
      y: 48,
    };
    boxCtx.font = "bold 16px Sans-Serif";
    boxCtx.fillStyle = "#ffffff";
    boxCtx.textAlign = "left";
    boxCtx.fillText(
      upperCaseString(player.activePokemon.name),
      textPos.x,
      textPos.y
    );

    // Pokeballs representing the players Pokémon team.
    const pokeballGap = 6;
    const pokeballSize = 14;
    const pokeballPos = {
      x: boxPadding,
      y: boxPadding,
    };
    player.team.forEach((pokemon, pokemonIndex) => {
      const pokeballX =
        pokeballPos.x + (pokeballSize + pokeballGap) * pokemonIndex;
      boxCtx.drawImage(
        pokeball,
        pokeballX,
        pokeballPos.y,
        pokeballSize,
        pokeballSize
      );
    });

    // Draw Box on Main Canvas.
    ctx.drawImage(boxCanvas, style.box.x, style.box.y);

    // Draw Moves.
    // Create Canvas.
    const movesCanvas = Canvas.createCanvas(canvas.width, 30);
    const movesCtx = movesCanvas.getContext("2d");

    // Text Settings.
    movesCtx.font = "bold 10px Sans-Serif";
    movesCtx.textAlign = "center";
    movesCtx.strokeStyle = "rgb(36,36,36)";

    // Pokemon Moves.
    const moveBoxWidth = movesCanvas.width / 5;
    const moveTextY = movesCanvas.height / 2;
    const moveGap = 10;
    player.activePokemon.moves.forEach((move, moveIndex) => {
      // Move Box Background
      movesCtx.fillStyle = "rgb(24,24,24)";
      const moveBoxX = (moveBoxWidth + moveGap) * moveIndex;
      roundRect(movesCtx, moveBoxX, 0, moveBoxWidth, movesCanvas.height, 16);

      // Move Name
      movesCtx.fillStyle = "#ffffff";
      const moveTextX = moveBoxX + moveBoxWidth / 2;
      movesCtx.fillText(upperCaseString(move.name), moveTextX, moveTextY);
    });

    // Draw Moves on Main Canvas.
    ctx.drawImage(movesCanvas, moveGap, style.moves.y);
  });

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "battle.png"
  );

  const battleEmbed = new Discord.MessageEmbed()
    .setTitle(title)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`);

  return battleEmbed;
};

const createChannel = async (msg, invitedUser) => {
  const everyoneRole = msg.guild.roles.everyone;

  const name = `${msg.author.username}-vs-${invitedUser.username}'`;

  const channel = await msg.guild.channels.create(name, {
    type: "text",
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: msg.author.id,
        allow: ["VIEW_CHANNEL"],
      },
      {
        id: invitedUser.id,
        allow: ["VIEW_CHANNEL"],
      },
    ],
  });
  return channel;
};
