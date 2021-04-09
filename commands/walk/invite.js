module.exports = {
  name: "invite",
  description:
    "Invite a user to your walk. This increases the chance of encountering rare pokémon while walking.",
  args: true,
  usage: "<user-tag>",
  guildOnly: true,
  execute(msg, args) {
    if (!msg.mentions.members.size) {
      msg.reply("your argument wasn't a user-tag.");
    }

    inviteUserToWalk(msg, msg.mentions.members.first());
  },
};

const inviteUserToWalk = (msg, invitedUser) => {};
