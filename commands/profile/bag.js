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
  const canvas = Canvas.createCanvas(600, 453);
  const ctx = canvas.getContext("2d");
  //Draw background
  const backgroundColor = "rgb(20,20,20)";
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Import registerFont to use custom fonts and register it
  ctx.font = "13px sans-serif";
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
  const pokemonsOnEachPage = 16;
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
  } else if (args[0]) {
    bagSort = args[0];
  } else {
    bagSort = standardSort;
  }

  const pokemonLength = await getUserPokemonCount(msg.author.id);
  const firstArg = args[0];

  if (firstArg == "buddy") {
    if (!isNaN(args[2])) {
      var choiceArg = args[1];
    } else {
      choiceArg = args[2] ? args[2].toLowerCase() : "";
    }
    //Check what arguments were given, and send back the correct responds
    if (!acceptableKeywords.includes(bagSort)) {
      msg.reply(
        `The correct way of using this command is (sortBy is optional): <p!bag buddy sortBy buddyNumber>`
      );
    } else if (choiceArg && choiceArg < pokemonLength) {
      const buddy = userPokemons[choiceArg - 1];
      msg.reply(`you chose: ${buddy.name} as your buddy!`);
      setBuddy(msg.author.id, buddy.docId);
    }
  } else if (firstArg == "switch") {
    //Define from and to numbers and use them to switch the pokemons
    const fromNumber = args[1];
    const toNumber = args[2];
    const savePokemon = userPokemons[fromNumber];
    userPokemons[fromNumber] = userPokemons[toNumber];
    userPokemons[toNumber] = savePokemon;
  }

  await drawBag(userPokemons, bagSort, msg.author.id, ctx, canvas, Canvas);

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

async function drawBag(userPokemons, bagSort, id, ctx, canvas, Canvas, msg) {
  const drawPokemonImage = require("../../utils/drawPokemonImage");
  const uiColor = "#84B6DF";

  var row = 0;
  const columnLength = 4;
  const spriteSize = 113;

  const { getBuddy } = require("../../database");
  const buddy = await getBuddy(id);

  userPokemons.forEach((pokemon, index) => {
    if (index % columnLength == 0 && index) {
      row += 1;
    }
    const posY = row * spriteSize;
    var posX = index * spriteSize - row * columnLength * spriteSize;
    const textPosY = posY;
    const textPosX = posX + spriteSize / 2;

    ctx.textAlign = "center";
    ctx.fillStyle = "white";

    if (buddy && buddy.docId == pokemon.docId) {
      ctx.fillStyle = uiColor;
      ctx.beginPath();
      ctx.arc(
        posX + spriteSize / 2,
        posY + spriteSize / 2,
        spriteSize / 2,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.fill();
      ctx.fillStyle = "rgb(20,20,20)";
    }

    ctx.fillText(pokemon[`${bagSort}`], textPosX, textPosY);

    const placement1 = spriteSize / 15;
    ctx.fillStyle = uiColor;
    ctx.beginPath();
    ctx.arc(
      posX - placement1 + spriteSize,
      posY + spriteSize - placement1 * 2,
      placement1,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgb(20,20,20)";

    //Get level
    const { getLevel } = require("./utils/levelAndXP");
    const level = getLevel(pokemon.xp);
    ctx.fillText(
      `${level}`,
      posX - placement1 + spriteSize,
      posY + spriteSize - placement1 * 3
    );

    drawPokemonImage(ctx, pokemon.id, posX, posY, spriteSize);
  });
  // Make new canvas and context /////////////////////////////////////////////////
  const sideCanvas = Canvas.createCanvas(spriteSize * 1.25, canvas.height);
  const ctx2 = sideCanvas.getContext("2d");

  ctx2.font = "13px sans-serif";

  ctx2.fillStyle = uiColor;
  ctx2.fillRect(0, 0, sideCanvas.width, sideCanvas.height);
  ctx2.fillStyle = "rgb(20,20,20)";
  // Draw black box
  const rim = sideCanvas.width * 0.025;
  ctx2.fillRect(
    rim,
    rim,
    sideCanvas.width - rim * 2,
    4 * spriteSize - (spriteSize / 2) * 2 - rim
  );
  // Draw black circle around buddy
  ctx2.beginPath();
  ctx2.arc(
    sideCanvas.width / 2,
    3 * spriteSize + spriteSize / 2,
    spriteSize / 2,
    0,
    2 * Math.PI
  );
  ctx2.lineWidth = 5;
  ctx2.stroke();

  // Draw the buddy
  if (buddy) {
    drawPokemonImage(
      ctx2,
      buddy.id,
      sideCanvas.width / 2 - spriteSize / 2,
      3 * spriteSize,
      spriteSize
    );
  }

  const alphabet = ["a", "b", "c"];

  //////////////////////Team//////////////////////
  const { getTeam } = require("../../database");
  const team = await getTeam(id);
  team.forEach((pokemon, index) => {
    //Get level
    const { getLevel } = require("./utils/levelAndXP");
    const level = getLevel(pokemon.xp);

    var posY2 = index * spriteSize;
    drawPokemonImage(
      ctx2,
      pokemon.id,
      sideCanvas.width / 2 - spriteSize / 2,
      posY2,
      spriteSize
    );
    ctx2.fillStyle = "white";
    ctx2.textAlign = "center";
    ctx2.fillText(
      `${alphabet[index]}:`,
      spriteSize / 10,
      posY2 + spriteSize / 2
    );
    ctx2.textBaseline = "top";
    ctx2.fillText(`Lv: ${level}`, sideCanvas.width / 2, posY2);
  });

  // Draw the second context//////////////////////
  ctx.drawImage(sideCanvas, canvas.width - sideCanvas.width, 0);
}
