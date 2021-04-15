module.exports = {
  name: "icon",
  description: "Edit the icon shown in the profile menu",
  execute(msg, args) {
    editProfileIcon(msg, args);
  },
};

async function editProfileIcon(msg, args) {
  //Setup and variables -------------------------------------
  const Discord = require("discord.js");
  const { updateUserIcon, getUserProfile } = require("../../database");
  const userDoc = await getUserProfile(msg.author.id);
  const trainerAmount = 13;
  const { getLevel } = require("./levelAndXP");
  const level = getLevel(userDoc.xp);
  const iconNumber = args[0];
  if (!isNaN(iconNumber) && iconNumber < trainerAmount) {
    if (iconNumber < level) {
      const trainerIcon = `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer${iconNumber}.png`;
      updateUserIcon(msg.author.id, trainerIcon);

      //Embed ---------------------------------------------------
      const embed = new Discord.MessageEmbed()
        .setTitle("New Icon")
        .setDescription(msg.author.toString())
        .setColor(53380)
        .setImage(trainerIcon)
        .setThumbnail(msg.author.avatarURL());
      msg.channel.send({ embed });
    } else {
      msg.channel.send("You have not unlocked that icon yet");
    }
  } else {
    msg.channel.send("That's not a valid icon number");
  }
}
