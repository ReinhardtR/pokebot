module.exports = {
  name: "bag",
  description: "Check your bag, and edit it!",
  needProfile: true,
  execute(msg, args) {
    pickBuddy(msg, args);
  },
};

async function pickBuddy(msg, args) {
  const Discord = require("discord.js");
  const {
    getUserPokemons,
    setBuddy,
    getTeam,
    updateTeam,
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
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "white";
  ctx.textBaseline = "top";

  const alphabet = ["a", "b", "c"];
  const team = await getTeam(msg.author.id);

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

  var bagSort = collectionSort;
  if (args[0] == "rarity") {
    bagSort = "rarity";
    userPokemons.sort((a, b) => b.rarity - a.rarity);
  }

  await drawBag(
    userPokemons,
    bagSort,
    msg.author.id,
    ctx,
    canvas,
    Canvas,
    alphabet,
    team
  );

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
      time: 120000,
      errors: ["Timeout"],
    })
    .then(async (collected) => {
      args = collected.first().content.split(" ");
      const firstArg = args[0];
      var secondArg = args[1];
      const thirdArg = args[2];
      if (firstArg == "buddy") {
        if (secondArg) {
          if (0 < secondArg < pokemonsOnEachPage) {
            if (!isNaN(secondArg)) {
              const buddy = userPokemons[secondArg - 1];
              const upperCaseString = require("../../utils/upperCaseString");
              msg.reply(
                `you chose: ${upperCaseString(buddy.name)} as your buddy!`
              );
              setBuddy(msg.author.id, buddy.docId);
            } else {
              msg.reply(`that's not a valid number.`);
            }
          } else {
            msg.reply(`the number you input didnt appear on the page.`);
          }
        } else {
          msg.reply(`you didn't input a number.`);
        }
      } else if (firstArg == "switch") {
        if (secondArg && thirdArg) {
          var fromNumber = secondArg - 1; // 1
          if (alphabet.includes(thirdArg)) {
            if (0 < secondArg < pokemonsOnEachPage) {
              //Define from and to numbers and use them to switch the pokemons
              const toTeamLetter = thirdArg; // a
              const upperCaseString = require("../../utils/upperCaseString");
              // Check if the pokemon attempted to be added is already in the team
              var teamPokemonDocIds = [];
              team.map((pokemon1, index) => {
                teamPokemonDocIds[index] = pokemon1.docId;
                return teamPokemonDocIds;
              });
              // Check if the spot it is added to is empty or not
              if (team[alphabet.indexOf(toTeamLetter)]) {
                msg.reply(
                  `you switched: ${upperCaseString(
                    userPokemons[fromNumber].name
                  )} and ${upperCaseString(
                    team[alphabet.indexOf(toTeamLetter)].name
                  )}!`
                );
              } else {
                msg.reply(
                  `you added: ${upperCaseString(
                    userPokemons[fromNumber].name
                  )} to your team!`
                );
              }
              // Check if user is adding a pokemon who is already a part of the team
              if (!teamPokemonDocIds.includes(userPokemons[fromNumber].docId)) {
                //Make the change to the team and update the team
                team[alphabet.indexOf(toTeamLetter)] = userPokemons[fromNumber]; // Team Pokemon = Pokemon from main (Primeape(team) = Jolteon)
                updateTeam(
                  msg.author.id,
                  team.map((pokemon) => pokemon.docId)
                );
              } else {
                //switch the two members
                const oldPokemonSpot = teamPokemonDocIds.indexOf(
                  team[alphabet.indexOf(toTeamLetter)].docId
                ); // Find position of the team original team member
                userPokemons[oldPokemonSpot] =
                  team[alphabet.indexOf(toTeamLetter)]; // Change the original team member to be the other team member
                team[alphabet.indexOf(toTeamLetter)] = userPokemons[fromNumber]; // Replace the new team member with the old team member on its dudplicate position
              }
              updateTeam(
                msg.author.id,
                team.map((pokemon) => pokemon.docId)
              );
            } else {
              msg.reply(`the number you input didnt appear on the page.`);
            }
          } else {
            msg.reply(`the team letter must be in the range!`);
          }
        } else {
          msg.reply(
            `switch takes input like so: <switch fromNumber toTeamLetter>.`
          );
        }
      }
    })
    .catch((error) => {
      console.log(error);
      msg.reply("time went out.");
    });
}

async function drawBag(
  userPokemons,
  bagSort,
  id,
  ctx,
  canvas,
  Canvas,
  alphabet,
  team
) {
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
      posY + spriteSize - placement1 * 1.5,
      placement1 * 2,
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

  ctx2.font = "20px sans-serif";

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

  //////////////////////Team//////////////////////
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
      spriteSize / 7,
      posY2 + spriteSize / 2
    );
    ctx2.textBaseline = "top";
    ctx2.fillText(`Lv: ${level}`, sideCanvas.width / 2, posY2);
  });

  // Draw the second context//////////////////////
  ctx.drawImage(sideCanvas, canvas.width - sideCanvas.width, 0);
}
