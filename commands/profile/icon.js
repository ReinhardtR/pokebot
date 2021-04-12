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
  const XPRise = 1200;
  const level = Math.floor(userDoc.xp / XPRise) || 1;
  iconNumber = args[0];
  if (
    (!isNaN(iconNumber) && iconNumber < trainerAmount) ||
    iconNumber == "all"
  ) {
    if (iconNumber * 2 < level) {
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
    } else if (iconNumber == "all") {
      //Setup canvas
      const Canvas = require("canvas");

      //Make canvas
      const canvas = Canvas.createCanvas(2500, 1500);
      const ctx = canvas.getContext("2d");

      // Draw background color
      ctx.fillStyle = "rgb(20,20,20)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      //Import registerFont to use custom fonts
      const { registerFont } = require("canvas");
      //Register the pokemon font
      registerFont("./fonts/Pokemon Classic.ttf", { family: "pokemonFont" });
      ctx.font = '70px "pokemonFont"';
      ctx.fillStyle = "white";
      ctx.textBaseline = "top";

      const rowAmount = 3;
      const columnAmount = 8;
      var t = 1;

      dance: for (i = 1; i < rowAmount; i++) {
        for (j = 1; j < columnAmount; j++) {
          y = (i - 1) * (canvas.height / (rowAmount - 1));
          textPosX = (j - 1) * (canvas.width / (columnAmount - 1));

          var trainer = 0;
          if (t > level * 2) {
            trainer = await Canvas.loadImage(
              `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/lock.png`
            );
          } else {
            trainer = await Canvas.loadImage(
              `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer${t}.png`
            );
          }
          ctx.fillText(`Lv: ${t}`, textPosX, y);
          ctx.drawImage(trainer, textPosX, y + canvas.height / (rowAmount * 2));
          t++;
          if (t > trainerAmount) {
            break dance;
          }
        }
      }

      // Create image file
      const attachment = new Discord.MessageAttachment(
        canvas.toBuffer(),
        "trainers.png"
      );

      // Create embed with image attached
      const embed = new Discord.MessageEmbed()
        .setTitle("All Icons")
        .setDescription(msg.author.toString())
        .setColor(53380)
        .attachFiles(attachment)
        .setImage(`attachment://${attachment.name}`)
        .setThumbnail(msg.author.avatarURL());
      msg.channel.send({ embed });
    } else {
      msg.channel.send("You have not unlocked that icon yet");
    }
  } else {
    msg.channel.send("That's not a valid icon number");
  }
}
