module.exports = {
  name: "buddy",
  description: "Pick a buddy for your journey!",
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
  const Discord = require("discord.js");
  const { getUserProfile } = require("../../database");
  const userDoc = await getUserProfile(msg.author.id);

  //Setup canvas
  const Canvas = require("canvas");

  //Make canvas
  const canvas = Canvas.createCanvas(2500, 1500);
  const ctx = canvas.getContext("2d");

  // Draw background
  ctx.fillStyle = "rgb(20,20,20)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Import registerFont to use custom fonts
  const { registerFont } = require("canvas");
  //Register the pokemon font
  registerFont("./fonts/Pokemon Classic.ttf", { family: "pokemonFont" });
  ctx.font = '50px "pokemonFont"';
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";

  const pokemons = userDoc.pokemons;

  const buddyPokemonId = getBuddyId(msg.author.id);
  const gap = 64;
  const y = 0;

  pokemons.forEach(pokemon, (index) => {
    drawPokemonImage(ctx, pokemon.id, index * gap, y);
    if (buddyPokemonId != pokemon) {
      ctx.fillText("Current buddy", index * gap, y);
    }
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
