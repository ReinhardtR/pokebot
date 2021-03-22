module.exports = {
  name: "help",
  description: "Open the help menu",
  execute(msg, args) {
    msg.channel.send(helpMenu(msg));
  },
};

function helpMenu(msg, commands) {
  const Discord = require("discord.js");
  const commands = require("../../client");
  console.log(commands);
  const embed = new Discord.MessageEmbed()
    .setTitle("Help Menu")
    .setDescription(msg.author.toString() + " here is all the help you need!")
    .setColor(53380);
  return embed;
}
