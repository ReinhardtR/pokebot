module.exports = {
  name: "walkmenu",
  description: "A menu that contains information about the walk command.",
  async execute(msg, args) {
    return await sendMenu(msg);
  },
};

async function sendMenu(msg) {
  const Discord = require("discord.js");
  const walkMenuGUI =
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/PokemonWalk.png";

  const embed = new Discord.MessageEmbed()
    .setTitle("Walk Menu")
    .setColor(53380)
    .setImage(walkMenuGUI);

  const botMsg = await msg.channel.send({ embed });

  await botMsg.react("1️⃣");
  await botMsg.react("2️⃣");

  const filter = (reaction, user) => {
    const isIncluded = ["1️⃣", "2️⃣"].includes(reaction.emoji.name);
    return isIncluded;
  };

  const execute = async (args) => {
    const command = require("../walk/walk");
    await command.execute(msg, args);
    botMsg.delete();
  };

  botMsg
    .awaitReactions(filter, {
      max: 1,
      time: 60000,
      errors: ["Reaction time ran out."],
    })
    .then(async (reactions) => {
      const reaction = reactions.first();
      if (reaction.emoji.name === "1️⃣") {
        execute(["start"]);
      } else if (reaction.emoji.name === "2️⃣") {
        execute(["stop"]);
      }
    });
}
