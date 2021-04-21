module.exports = {
  name: "bag",
  description: "Pick a buddy for your journey!",
  needProfile: true,
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
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

  //Define values to be used in the firstArg checks
  const acceptableKeywords = ["name", "id", "xp"];
  const standardSort = "id";
  const collectionSort =
    args[0] && acceptableKeywords.includes(args[0])
      ? args[0].toLowerCase()
      : standardSort;

  //Collect the pokemons from firebase
  const pokemonsOnEachPage = 20;
  const userPokemonsData = await getUserPokemons(
    msg.author.id,
    pokemonsOnEachPage,
    collectionSort,
    collectionSort === "name" ? "asc" : "desc"
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

  if (args[0] == "rarity") {
    var bagSort = "rarity";
    userPokemons.sort((a, b) => b.rarity - a.rarity);
  }

  const pokemonLength = await getUserPokemonCount(msg.author.id);

  // if (firstArg == "buddy") {
  //   if (!isNaN(args[2])) {
  //     var choiceArg = args[1];
  //   } else {
  //     choiceArg = args[2] ? args[2].toLowerCase() : "";
  //   }
  //   //Check what arguments were given, and send back the correct responds
  //   if (!acceptableKeywords.includes(sortArg)) {
  //     msg.reply(
  //       `The correct way of using this command is (sortBy is optional): <p!bag buddy sortBy buddyNumber>`
  //     );
  //   } else if (choiceArg && choiceArg < pokemonLength) {
  //     const buddy = userPokemons[choiceArg - 1];
  //     msg.reply(`you chose: ${buddy.name} as your buddy!`);
  //     setBuddy(msg.author.id, buddy.docId);
  //   }
  // } else if (firstArg == "switch") {
  //   //Define from and to numbers and use them to switch the pokemons
  //   const fromNumber = args[1];
  //   const toNumber = args[2];
  //   const savePokemon = userPokemons[fromNumber];
  //   userPokemons[fromNumber] = userPokemons[toNumber];
  //   userPokemons[toNumber] = savePokemon;
  // }

  await drawBag(userPokemons, bagSort, msg.author.id, ctx);

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

  const filter = (m) => {
    const validArg = ["buddy", "switch"].find((string) =>
      m.content.startsWith(string)
    );
    const sameUser = m.author.id === msg.author.id;
    return validArg && sameUser;
  };

  msg.channel
    .awaitMessages(filter, {
      max: 1,
      time: 60000,
      errors: ["Timeout"],
    })
    .then((collected) => {
      console.log(collected);
    })
    .catch((error) => {
      msg.reply("time went out.");
    });
}

async function drawBag(userPokemons, bagSort, id, ctx) {
  const drawPokemonImage = require("../../utils/drawPokemonImage");

  var row = 0;
  const spriteSize = 256;

  const { getBuddy } = require("../../database");
  const buddy = await getBuddy(id);

  userPokemons.forEach((pokemon, index) => {
    const posX = index * spriteSize;
    if (posX > ctx.width + spriteSize) {
      row += 1;
    }
    const posY = row * spriteSize;

    const textPosX = posX + spriteSize / 2;
    ctx.textAlign = "center";
    ctx.fillText(pokemon[bagSort], textPosX, posY);

    if (buddy && buddy.docId == pokemon.docId) {
      ctx.fillText("Buddy", posX - columnStart, posY * spriteSize);
    }

    drawPokemonImage(ctx, pokemon.id, posX, posY, spriteSize);
  });
}
