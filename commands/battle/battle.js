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

    const { getUserProfile } = require("../../database");
    const invitedUserProfile = await getUserProfile(invitedUser.id);

    if (!invitedUserProfile) {
      return msg.reply(
        `${invitedUser.toString()} doesn't have a profile. Encourage him to create one!`
      );
    }

    const { battles } = msg.client;

    const userBattle =
      battles.get(msg.author.id) ||
      (await battles.find((battle) => battle.player2 == msg.auhor.id));

    if (userBattle) {
      return msg.reply("you're already in a battle.");
    }

    const Discord = require("discord.js");

    const inviteEmbed = new Discord.MessageEmbed().setTitle(
      `${msg.author.username} challenged ${invitedUser.username}!`
    );

    const botInviteMsg = await msg.channel.send({ embed: inviteEmbed });

    await botInviteMsg.react("✅");
    await botInviteMsg.react("❌");

    const filter = async (reaction, user) => {
      console.log(reaction);
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

      channel.send(`${msg.author.tag} vs ${invitedUser.toString()}!`);
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
