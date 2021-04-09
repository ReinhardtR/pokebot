module.exports = {
  name: "profile",
  description: "Show Player Profile; xp, level, name, guild and character icon",
  usage: "[user-tag]",
  execute(msg, args) {
    var user = msg.author;
    if (msg.mentions.members.size) {
      user = msg.mentions.members.first().user;
    }
    sendProfile(msg, user);
  },
};

//Function to change thousands to "K" in xp and xpneeded
function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
    : Math.sign(num) * Math.abs(num);
}

async function sendProfile(msg, user, args) {
  //Setup and variables -------------------------------------
  //Setup discord, database and profile data
  const { getUserProfile } = require("../../database");
  const Discord = require("discord.js");
  const userDoc = await getUserProfile(msg.author.id);

  //Setup canvas
  const Canvas = require("canvas");

  //Import registerFont to use custom fonts
  const { registerFont } = require("canvas");
  //Register the pokemon font
  registerFont("./fonts/Pokemon Classic.ttf", { family: "pokemonFont" });

  //Make canvas
  const canvas = Canvas.createCanvas(2500, 1500);
  const ctx = canvas.getContext("2d");

  //XP math (can be moved to dedicated script)
  const XPRise = 1200;
  const XPNeeded = Math.floor(userDoc.level * XPRise);

  //Coordinate variables
  const cw = canvas.width;
  const ch = canvas.height;
  const XPbarX = cw * 0.0325;
  const XPbarY = ch * 0.32;
  const WS = cw * 0.925;
  const HS = ch * 0.02;

  //Colors in order of use
  const backgroundCol = "#D34831";
  const backgroundBoxCol = "#679F9E";
  const progressBarBackground = "#B2B693";
  const progressBarCol = "#64BAC9";
  const progressBarOutlineCol = "#2C350A";
  const textCol = "#F3FCFF";

  //Trainer image
  const trainerTemp =
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer_0001_row-1-col-2.png";
  const trainer = await Canvas.loadImage(trainerTemp);

  //Drawing -------------------------------------------------
  //Background
  ctx.fillStyle = backgroundCol;
  ctx.fillRect(0, 0, cw, ch);
  //Background Box
  ctx.fillStyle = backgroundBoxCol; //Battle bar color: #2C350A
  ctx.fillRect(
    XPbarX / 2,
    XPbarX / 2 - XPbarX / 4,
    WS + XPbarX,
    ch * 0.925 + XPbarX / 2 + XPbarX / 4
  );

  //XP bar
  //Progress bar background
  ctx.fillStyle = progressBarBackground;
  ctx.fillRect(XPbarX, XPbarY, WS, HS);
  //Progress bar
  ctx.fillStyle = progressBarCol;
  ctx.fillRect(XPbarX, XPbarY, WS * 0.01 * (100 * (userDoc.xp / XPNeeded)), HS);
  //XP bar outline
  ctx.strokeStyle = progressBarOutlineCol;
  ctx.lineWidth = 15;
  ctx.strokeRect(XPbarX, XPbarY, WS, HS);

  // User tag
  ctx.font = '70px "pokemonFont"';
  ctx.fillStyle = textCol;
  ctx.textBaseline = "top";
  ctx.fillText(user.tag, XPbarX, ch * 0.05);

  //Level and pokemon amount
  ctx.textAlign = "end";
  ctx.fillText(
    `Pokémon: ${userDoc.pokemons.length}  Lv: ${userDoc.level}`,
    WS,
    XPbarX
  );

  //XP
  ctx.font = '50px "pokemonFont"';
  const XPText = kFormatter(userDoc.xp);
  XPNeededText = kFormatter(XPNeeded);
  ctx.fillText(XPText + "/" + XPNeededText + " xp", WS, ch * 0.05 + 250);

  ctx.drawImage(trainer, XPbarX, XPbarY + ch * 0.05);

  //Make attachment from canvas
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "profile.png"
  );

  //Embed ---------------------------------------------------
  const embed = new Discord.MessageEmbed()
    .setTitle("User Profile")
    .setDescription(msg.author.toString())
    .setColor(53380)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`)
    .setThumbnail(msg.author.avatarURL());
  msg.channel.send({ embed });
}
