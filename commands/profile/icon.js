module.exports = {
  name: "editicon",
  description: "Edit the icon shown in the profile menu",
  usage: "[user-tag]",
  execute(msg, args) {
    editProfileIcon(msg, args);
  },
};

async function editProfileIcon(msg, args) {
  //Setup and variables -------------------------------------
  const Discord = require("discord.js");
  const { updateUserIcon, getUserProfile } = require("../../database");
  const userDoc = await getUserProfile(msg.author.id);
  iconGet: try {
    iconNumber = args[0].toLowerCase();
    console.log(userDoc.level);
    if (iconNumber * 2 < userDoc.level) {
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
      break iconGet;
    }
  } catch (err) {
    msg.channel.send("That's not a valid icon number");
    console.log(err);
  }
}
