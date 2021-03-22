module.exports = {
  name: "help",
  description: "Open the help menu",
  execute(msg, args) {
    helpMenu(botMsg, msg);
  },
};

function helpMenu(botMsg, userMsg) {
  const Discord = require("discord.js");
  const helpEmbed = new Discord.MessageEmbed()
    .setTitle("Help Menu")
    .setDescription(
      userMsg.author.toString() + " here is all the help you need!"
    )
    .setColor(53380);

  botMsg.edit({ embed: helpEmbed });
}
