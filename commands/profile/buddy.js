module.exports = {
  name: "buddy",
  description: "Pick a buddy for your journey!",
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
  const Discord = require("discord.js");
  const { getBuddy, getUserPokemons } = require("../../database");

  //Setup canvas
  const Canvas = require("canvas");
  //Make canvas
  const canvas = Canvas.createCanvas(2560, 1280);
  const ctx = canvas.getContext("2d");
  //Draw background
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
  ///////////////////////////////////////////////////////////Too many firebase calls
  //const pokemons = await getUserPokemons(msg.author.id);
  const acceptableKeywords = ["name", "id", "xp"];

  var sortArg = args[0]?.toLowerCase();

  if (!acceptableKeywords.includes(sortArg)) {
    sortArg = "id";
    msg.reply(
      `you did not define an suffix so it is automatically set to: ${sortArg}`
    );
  }

  const drawPokemonImage = require("../../utils/drawPokemonImage");
  // const pokemons = await getUserPokemons(msg.author.id, 20, sortArg, "desc");
  const buddyPokemonId = await getBuddy(msg.author.id);
  const pokemons = [
    { level: 1, name: "mew", xp: 0, id: 151 },
    { xp: 0, id: 150, level: 1, name: "mewtwo" },
    { id: 149, name: "dragonite", level: 1, xp: 0 },
    { id: 148, name: "dragonair", level: 1, xp: 0 },
  ];
  const gap = 64;
  var y = 0;
  var columnStart = 0;
  var columnAmount = 10;

  pokemons.forEach((pokemon, index) => {
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
