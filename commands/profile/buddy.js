module.exports = {
  name: "buddy",
  description: "Pick a buddy for your journey!",
  needProfile: true,
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
  const Discord = require("discord.js");
  const {
    getBuddy,
    getUserPokemons,
    getUserPokemonCount,
    setBuddy,
  } = require("../../database");

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
  var pageNumber = 1;
  const pokemonsOnEachPage = 20;

  const acceptableKeywords = ["name", "id", "xp", "rarity"];

  const pokemonLength = await getUserPokemonCount(msg.author.id);
  var sortArg = args[0] ? args[0].toLowerCase() : "rarity";
  var choiceArg = args[1] ? args[1].toLowerCase() : "";
  const userPokemonsData = await getUserPokemons(
    msg.author.id,
    pokemonsOnEachPage * pageNumber,
    sortArg,
    "desc"
  );
  /*const userPokemonsData = [
    {
      docId: "AQAWEr9HBpWrLQ0V4ntp",
      moves: Array(4),
      xp: 0,
      id: 102,
      name: "exeggcute",
    },
    {
      docId: "31ZgGtx7324d8knXFGat",
      name: "vulpix",
      moves: Array(4),
      id: 37,
      xp: 0,
    },
  ];*/

  const pokemons = require("../../constants/pokemons.json");

  const userPokemons = userPokemonsData.map((userPokemon) => {
    const pokemonData = pokemons[userPokemon.id - 1];

    return {
      rarity: pokemonData.rarity,
      ...userPokemon,
    };
  });

  if (!acceptableKeywords.includes(sortArg)) {
    sortArg = "id";
    msg.reply(
      `you did not define an suffix so it is automatically set to: ${sortArg}`
    );
    if (!isNaN(sortArg) && sortArg < pokemonLength) {
      msg.reply(`you chose pokemon number: ${sortArg}`);
      setBuddy(msg.author.id, userPokemons[sortArg].docId);
    }
  } else if (!isNaN(choiceArg) && choiceArg < pokemonLength) {
    msg.reply(`you chose pokemon number: ${choiceArg}`);
    setBuddy(msg.author.id, userPokemons[choiceArg - 1].docId);
  }

  const drawPokemonImage = require("../../utils/drawPokemonImage");
  const buddyPokemonId = await getBuddy(msg.author.id);
  const gap = 256;
  var y = 0;
  var columnStart = 0;
  var columnAmount = 10;

  userPokemons.forEach((pokemon, index) => {
    var loc = index * gap;
    if (loc > ctx.width) {
      y++;
      columnStart += columnAmount;
    }
    if (buddyPokemonId === pokemon) {
      ctx.textAlign = "center";
      ctx.fillText("Buddy", loc - columnStart, y * gap);
    }
    ctx.fillText(pokemon[sortArg], loc - columnStart, y * gap);
    drawPokemonImage(ctx, pokemon.id, loc - columnStart, y * gap, gap);
  });

  // Create image file
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "buddy.png"
  );

  // Create embed with image attached
  const embed = new Discord.MessageEmbed()
    .setTitle("Buddy Selection")
    .setDescription(msg.author.toString())
    .setColor(53380)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`)
    .setThumbnail(msg.author.avatarURL());
  msg.channel.send({ embed });
}
