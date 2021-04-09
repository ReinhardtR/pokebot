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
  return await msg.channel.send({ embed });
}
