module.exports = {
  name: "bag",
  description: "Pick a buddy for your journey!",
  needProfile: true,
  execute(msg, args) {
    const userId = msg.author.id;
    pickBuddy(msg, userId, args);
  },
};

async function drawBag(userPokemons, sortArg, userId, ctx) {
  var y = 0;
  var columnStart = 0;
  var columnAmount = 10;
  const spriteSize = 256;

  const drawPokemonImage = require("../../utils/drawPokemonImage");
  const { getBuddy } = require("../../database");
  const buddyPokemonId = await getBuddy(userId);
  userPokemons.forEach((pokemon, index) => {
    var loc = index * spriteSize;
    if (loc > ctx.width) {
      y++;
      columnStart += columnAmount;
    }
    if (buddyPokemonId === pokemon) {
      ctx.textAlign = "center";
      ctx.fillText("Buddy", loc - columnStart, y * spriteSize);
    }
    ctx.fillText(pokemon[sortArg], loc - columnStart, y * spriteSize);
    drawPokemonImage(
      ctx,
      pokemon.id,
      loc - columnStart,
      y * spriteSize,
      spriteSize
    );
  });
}

async function pickBuddy(msg, userId, args) {
  const Discord = require("discord.js");
  const {
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

  //Import registerFont to use custom fonts and register it
  const { registerFont } = require("canvas");
  registerFont("./fonts/Pokemon Classic.ttf", { family: "pokemonFont" });
  ctx.font = '50px "pokemonFont"';
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";

  //Collect the pokemons from firebase
  const pokemonsOnEachPage = 20;
  const userPokemonsData = await getUserPokemons(
    userId,
    pokemonsOnEachPage,
    sortArg
  );

  //Get pokemons and return their rarity
  const pokemons = require("../../constants/pokemons.json");
  const userPokemons = userPokemonsData.map((userPokemon) => {
    const pokemonData = pokemons[userPokemon.id - 1];
    return {
      rarity: pokemonData.rarity,
      ...userPokemon,
    };
  });

  //Define values to be used in the firstArg checks
  const acceptableKeywords = ["name", "id", "xp", "rarity"];
  const pokemonLength = await getUserPokemonCount(userId);
  const firstArg = args[0];
  var sortArg = args[1] ? args[1].toLowerCase() : "id";

  //User firstArg to check what the player wants, and dragBag based on the result
  if (!firstArg || acceptableKeywords.includes(firstArg)) {
    drawBag(userPokemons, sortArg, userId, ctx);
  } else if (firstArg == "buddy") {
    if (!args[2]) {
      var choiceArg = args[1];
    } else {
      choiceArg = args[2] ? args[2].toLowerCase() : "";
    }
    //Check what arguments were given, and send back the correct responds
    if (!acceptableKeywords.includes(sortArg)) {
      msg.reply(
        `The correct way of using this command is (sortBy is optional): <p!bag buddy sortBy buddyNumber>`
      );
    } else if (!isNaN(choiceArg) && choiceArg < pokemonLength) {
      const buddy = userPokemons[choiceArg - 1];
      msg.reply(`you chose: ${buddy.name} as your buddy!`);
      setBuddy(userId, buddy.docId);
    }
    drawBag(userPokemons, sortArg, userId, ctx);
  } else if (firstArg == "switch") {
    //Define from and to numbers and use them to switch the pokemons
    const fromNumber = args[1];
    const toNumber = args[2];
    const savePokemon = userPokemons[fromNumber];
    userPokemons[fromNumber] = userPokemons[toNumber];
    userPokemons[toNumber] = savePokemon;
    drawBag(userPokemons, sortArg, userId, ctx);
  } else {
    msg.reply(`The fuck you do, homeboy?`);
  }

  // Create image file
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "bag.png"
  );

  // Create embed with image attached
  const embed = new Discord.MessageEmbed()
    .setTitle("Bag")
    .setDescription(msg.author.toString())
    .setColor(53380)
    .attachFiles(attachment)
    .setImage(`attachment://${attachment.name}`)
    .setThumbnail(msg.author.avatarURL());
  msg.channel.send({ embed });
}
