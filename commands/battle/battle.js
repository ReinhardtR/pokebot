module.exports = {
  name: "battle",
  args: true,
  usage: "<user-tag>",
  guildOnly: true,
  needProfile: true,
  async execute(msg, args) {
    if (!msg.mentions.members.size) {
      return msg.reply("you didn't mention a user.");
    }

    const invitedUser = msg.mentions.members.first().user;

    if (invitedUser.id == msg.author.id) {
      return msg.reply("you can't battle yourself. Battle a friend instead!");
    }

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

    const Discord = require("discord.js");

    const inviteEmbed = new Discord.MessageEmbed().setTitle(
      `${msg.author.username} challenged ${invitedUser.username}!`
    );

    const botInviteMsg = await msg.channel.send({ embed: inviteEmbed });

    await botInviteMsg.react("✅");
    await botInviteMsg.react("❌");

    const filter = async (reaction, user) => {
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
      .awaitReactions(filter, {
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

      const player1Team = invitedUserProfile.team;
      const player2Team = userProfile.team;

      const player1 = {
        team: player1Team,
        activePokemon: player1Team[0],
      };

      const player2 = {
        team: player2Team,
        activePokemon: player2Team[0],
      };

      const battleEmbed = getBattleEmbed([player1, player2]);
      battleEmbed.setTitle(`${msg.author.username} vs ${invitedUser.username}`);

      channel.send({ embed: battleEmbed });
    };
  },
};

const Canvas = require("canvas");
const drawPokemonImage = require("../../utils/drawPokemonImage");
const background = await Canvas.loadImage(
  "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/battleBackground.png"
);

const getBattleEmbed = (players) => {
  const canvas = Canvas.createCanvas(background.width, background.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(background, 0, 0);

  const pokemonSize = 128;

  const styles = {
    player1: {
      pokemon: { x: 100 - pokemonSize / 2, y: 100, size: 128 },
      name: {
        x: 2,
        y: 2,
      },
      showBack: false,
      clipY: 45,
    },
    player2: {
      pokemon: {
        x: 300 - pokemonSize / 2,
        y: 30,
        size: 100,
      },
      name: {
        x: 2,
        y: 2,
      },
      showBack: true,
      clipY: 0,
    },
  };

  ctx.font = "bold 16px Sans-Serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  players.forEach((player, index) => {
    const style = styles[`${player}${index}`];

    drawPokemonImage(
      ctx,
      player.activePokemon.id,
      style.x,
      style.y,
      style.size,
      style.showBack,
      style.clipY
    );
  });

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "player1Team.png"
  );

  const battleEmbed = new Discord.MessageEmbed()
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
