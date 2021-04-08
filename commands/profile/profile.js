module.exports = {
  name: "profile",
  description: "Show Player Profile",
  usage: "[user-tag]",
  execute(msg, args) {
    sendProfile(msg);
  },
};

async function sendProfile(msg, args) {
  const { getUserProfile } = require("../../database");
  const Discord = require("discord.js");
  const embed = new Discord.MessageEmbed()
    .setTitle("Profile Menu")
    .setDescription(msg.author.toString() + "'s Player profile")
    .setColor(53380);
  const userDoc = await getUserProfile(msg.author.id);
  console.log(userDoc);
  msg.channel.send({ embed });
}
