module.exports = {
  name: "bag",
  description: "See what you have in your bag.",
  execute(msg, args) {
    openBag(msg);
  },
}

async function openBag(msg){
  const {getBagContents} = require("../../index");
  //Setup canvas
  const Canvas = require("canvas");

  //Make canvas
  const canvas = Canvas.createCanvas(2500, 1500);
  const ctx = canvas.getContext("2d");

  // Draw background color
  ctx.fillStyle = "rgb(20,20,20)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bag = getBagContents(msg.author.id);

  bag.forEach(item, index => {
      const image = await Canvas.loadImage(
        `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/items/pokeball.png`
      );
    ctx.fillText(`${bag.amount}x`, textPosX, y);
    ctx.drawImage(image, textPosX, y + canvas.height / (rowAmount * 2));
  });

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
}