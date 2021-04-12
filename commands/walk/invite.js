const walk = require("./walk");

module.exports = {
  name: "invite",
  description:
    "Invite a user to your walk. This increases the chance of encountering rare pokémon while walking.",
  args: true,
  usage: "<user-tag>",
  guildOnly: true,
  async execute(msg, args) {
    if (!msg.mentions.members.size) {
      return msg.reply("your argument wasn't a user-tag.");
    }

    const invitedUser = msg.mentions.members.first().user;

    if (invitedUser.id === msg.author.id) {
      return msg.reply("you can't invite yourself to go on a walk.");
    }

    const { walks } = msg.client;
    const userWalk = walks.get(msg.author.id);

    if (!userWalk) {
      return msg.reply("you're not currently on a walk.");
    }

    if (userWalk.members.includes(invitedUser.id)) {
      return msg.reply(
        `${invitedUser.toString()} is already a member of this walk.`
      );
    }

    const memberString = userWalk.members.length > 1 ? "members" : "member";

    const botMsg = await invitedUser.send(
      `You've been invited to go on a walk, in **${msg.guild.name}**, by ${msg.author}.\nThe walk currently has **${userWalk.members.length} ${memberString}**.\nJoin them by reacting with ✅, or deny the invitation by reacting with ❌.`
    );

    await botMsg.react("✅");
    await botMsg.react("❌");

    const filter = (reaction, user) => {
      const isIncluded = ["✅", "❌"].includes(reaction.emoji.name);
      return isIncluded;
    };

    botMsg
      .awaitReactions(filter, {
        max: 1,
        time: 60000,
        errors: ["Invitation time-out."],
      })
      .then((reactions) => {
        const reaction = reactions.first();
        if (reaction.emoji.name === "✅") {
          userWalk.members.push(invitedUser.id);

          userWalk.channel.updateOverwrite(invitedUser.id, {
            VIEW_CHANNEL: true,
          });

          userWalk.channel.setTopic(`**Members**: ${userWalk.members.length}`);
        } else if (reaction.emoji.name === "❌") {
          msg.reply(`${invitedUser.toString()} didn't accept your invitation.`);
        }
      });
  },
};
