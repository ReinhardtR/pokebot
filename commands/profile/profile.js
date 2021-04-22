module.exports = {
  name: "profile",
  description: "Show Player Profile: xp, level, name, guild and character icon",
  usage: "[user-tag]",
  needProfile: true,
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

async function sendProfile(msg, user) {
  //Setup and variables -------------------------------------
  //Setup discord, database and profile data
  const {
    getUserProfile,
    sortLevelsAndReturnRank,
    getUserPokedex,
  } = require("../../database");
  const userDoc = await getUserProfile(user.id);

  // discord.js
  const Discord = require("discord.js");

  //Setup canvas
  const Canvas = require("canvas");

  //Import registerFont to use custom fonts
  const { registerFont } = require("canvas");
  //Register the pokemon font
  registerFont("./fonts/Pokemon Classic.ttf", { family: "pokemonFont" });

  //Make canvas
  const canvas = Canvas.createCanvas(2500, 1500);
  const ctx = canvas.getContext("2d");

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

  //Get trainer image
  const trainer = await Canvas.loadImage(userDoc.trainer);

  //Get rank
  const rank = await sortLevelsAndReturnRank(user.id);

  //Get level and xp
  const {
    getXPNeeded,
    getLevel,
    getXPDisplayed,
  } = require("./utils/levelAndXP");
  const level = getLevel(userDoc.xp);
  const xpNeeded = getXPNeeded(level);
  const xpDisplayed = getXPDisplayed(userDoc.xp);

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
  ctx.fillRect(
    XPbarX,
    XPbarY,
    WS * 0.01 * (100 * (xpDisplayed / xpNeeded)),
    HS
  );
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
  ctx.fillText(`Rank: ${rank}  Lv: ${level}`, WS, XPbarX);

  //XP
  ctx.font = '50px "pokemonFont"';
  const XPText = kFormatter(xpDisplayed);
  const XPNeededText = kFormatter(xpNeeded);
  ctx.fillText(XPText + "/" + XPNeededText + " xp", WS, ch * 0.05 + 250);

  //Trainer icon
  ctx.drawImage(trainer, XPbarX, XPbarY + ch * 0.05);

  //Badges
  const userPokedex = await getUserPokedex(user.id);
  const badges = require("../../constants/badges.json");
  const badgeSize = 128;
  const badgeGap = 25;
  const y = XPbarY + ch * 0.05;
  const xPos = 350;
  await Promise.all(
    badges.map(async (badge, index) => {
      var hasBadge;
      const x = index * (badgeSize + badgeGap) + xPos;
      if (badge.requirement.type == "length") {
        hasBadge = userPokedex.length >= badge.requirement.value;
      } else if (badge.requirement.type == "includes") {
        hasBadge = userPokedex.includes(badge.requirement.values);
      }

      if (!hasBadge) {
        image = await Canvas.loadImage(
          `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/lock.png`
        );
      } else {
        var image = await Canvas.loadImage(badge.badgeURL);
      }

      ctx.drawImage(image, x, y, badgeSize, badgeSize);
    })
  );

  //Buddy
  const { getBuddy } = require("../../database");
  const buddyPokemon = await getBuddy(msg.author.id);
  if (buddyPokemon) {
    const drawPokemonImage = require("../../utils/drawPokemonImage");
    const buddySize = 300;
    drawPokemonImage(
      ctx,
      buddyPokemon.id,
      WS - buddySize,
      XPbarY + ch * 0.05,
      buddySize
    );
  }

  //Make attachment from canvas
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "profile.png"
  );

  //Embed ---------------------------------------------------
  const embed = new Discord.MessageEmbed()
    .setTitle("User Profile")
    .setDescription(user.toString())
    .setColor(53380)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`)
    .setThumbnail(user.avatarURL());
  msg.channel.send({ embed });
}
