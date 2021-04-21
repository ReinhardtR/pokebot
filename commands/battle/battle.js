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

    const Canvas = require("canvas");
    const drawPokemonImage = require("../../utils/drawPokemonImage");

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

      const players = [player1Team, player2Team];

      const canvas = Canvas.createCanvas(400, 300);
      const ctx = canvas.getContext("2d");

      const background = await Canvas.loadImage("");

      const pokemonSize = 128;

      players.forEach((team, teamIndex) => {
        const back = teamIndex == 0 ? true : false;
        team.forEach((pokemon, pokemonIndex) => {
          const pokemonPos = {
            x: pokemonSize * pokemonIndex,
            y: pokemonSize * teamIndex,
          };

          drawPokemonImage(
            ctx,
            pokemon.id,
            pokemonPos.x,
            pokemonPos.y,
            pokemonSize,
            back
          );
        });
      });

      const attachment = new Discord.MessageAttachment(
        canvas.toBuffer(),
        "player1Team.png"
      );

      const battleEmbed = new Discord.MessageEmbed()
        .setTitle(`${msg.author.username} vs ${invitedUser.username}`)
        .attachFiles(attachment)
        .setImage(`attachment://${attachment.name}`);

      channel.send({ embed: battleEmbed });
    };
  },
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
