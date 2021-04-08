module.exports = {
  name: "walkmenu",
  description: "A menu that contains information about the walk command.",
  execute(msg, args) {
    sendMenu(msg, args);
  },
};

function sendMenu(msg) {
  console.log("yo");
  const Discord = require("discord.js");
  const walkMenuGUI =
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/PokemonWalk.png";
  const embed = new Discord.MessageEmbed()
    .setTitle("Walk Menu")
    .setColor(53380)
    .setImage(walkMenuGUI);
  msg.channel.send({ embed });
}
