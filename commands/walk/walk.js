module.exports = {
  name: "walk",
  description: "Go on a walk, and look for Pokémons!",
  args: true,
  guildOnly: true,
  usage: "<start or stop>",
  async execute(msg, args) {
    const { walks } = msg.client;
    const userWalk = walks.get(msg.author.id);
    const channelWalk = await walks.find(
      (walk) => walk.channel.id === msg.channel.id
    );

    if (args[0] === "start") {
      if (userWalk) {
        msg.reply(`you're already on a walk in <#${userWalk.channel.id}>`);
      } else if (channelWalk) {
        msg.reply(`there is already a walk in this channel.`);
      } else {
        startWalk(msg);
      }
    } else if (args[0] === "stop") {
      if (userWalk && !channelWalk) {
        msg.reply(
          `you're not on a walk in this channel. You're walking in <#${userWalk.channel.id}>.`
        );
      } else if (!userWalk) {
        msg.reply("you're not currently on a walk.");
      } else {
        stopWalk(msg);
      }
    }
  },
};

const startWalk = (msg) => {
  const createWalk = require("./utils/createWalk");
  createWalk(msg, 1, true);

  msg.channel.send(
    `A walk in <#${msg.channel.id}> has been started by ${msg.author}!`
  );
};

const stopWalk = (msg) => {
  const deleteWalk = require("./utils/deleteWalk");
  deleteWalk(msg);

  msg.channel.send(
    `The walk by ${msg.author} in <#${msg.channel.id}> has ended.`
  );
};
