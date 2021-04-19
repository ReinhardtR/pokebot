module.exports = {
  name: "buddy",
  description: "Pick a buddy for your journey!",
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
  const Discord = require("discord.js");
  const { getBuddyId, getUserPokemons } = require("../../database");

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

  //Buddy
  const pokemons = await getUserPokemons(msg.author.id);
  const buddyPokemonId = await getBuddyId(msg.author.id);
  const gap = 64;
  var y = 0;
  var columnStart = 0;
  var columnAmount = 7;

  console.log(pokemons);

  pokemons.foreach((pokemon, index) => {
    if (buddyPokemonId != pokemon) {
      if (index * gap > ctx.width) {
        y++;
        columnStart += columnAmount;
      }
      ctx.textAlign = "center";
      ctx.fillText("Buddy", index * gap - columnStart, y * gap);
    }
    drawPokemonImage(ctx, pokemon.id, index * gap - columnStart, y * gap);
  });

  // Create image file
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "buddy.png"
  );

  // Create embed with image attached
  const embed = new Discord.MessageEmbed()
    .setTitle("Buddies")
    .setDescription(msg.author.toString())
    .setColor(53380)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`)
    .setThumbnail(msg.author.avatarURL());
  msg.channel.send({ embed });
}
