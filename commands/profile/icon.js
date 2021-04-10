module.exports = {
  name: "editicon",
  description: "Edit the icon shown in the profile menu",
  usage: "[user-tag]",
  execute(msg, args) {
    editProfileIcon(msg);
  },
};

async function editProfileIcon(msg, args) {
  //Setup and variables -------------------------------------
  const { getUserProfile } = require("../../database");
  const Discord = require("discord.js");
  try {
    const trainerIcon = `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer${args[0]}.png`;
    updateUserIcon(msg.author.id, trainerIcon);

    //Embed ---------------------------------------------------
    const embed = new Discord.MessageEmbed()
      .setTitle("New Icon")
      .setDescription(msg.author.toString())
      .setColor(53380)
      .setImage(trainerIcon)
      .setThumbnail(msg.author.avatarURL());

    msg.channel.send({ embed });
  } catch {
    msg.channel.send("That's not a valid icon nunmer");
  }
}
