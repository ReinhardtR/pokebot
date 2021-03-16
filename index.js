// Enviroment Variables
require("dotenv").config();

// Discord.js
const Discord = require("discord.js");
const client = new Discord.Client();

// Canvas
const Canvas = require("canvas");

// Pokemon API
const Pokedex = require("pokedex-promise-v2");
const P = new Pokedex();

// Constants
const PREFIX = "p!";
const menuGUI = "https://i.imgur.com/Sx2mQTH.png";

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "yo") {
    msg.channel.send("yo");
  }

  if (msg.content === PREFIX + "pokedex") {
    // Get Pokemon data
    const getData = new Promise((resolve, reject) => {
      P.getGenerationByName("generation-i").then((item) => {
        const data = item.pokemon_species.map((pokemon, index) => {
          return P.resource(`/api/v2/pokemon/${pokemon.name}`).then(
            (pokemonData) => ({
              name: pokemonData.name,
              sprite: pokemonData.sprites.front_default,
              id: pokemonData.id,
            })
          );
        });
        console.log(data);
        resolve(Promise.all(data));
      });
    });

    // Create canvas
    const canvas = Canvas.createCanvas(2500, 3200);
    const ctx = canvas.getContext("2d");
    // Draw background color
    ctx.fillStyle = "rgb(20,20,20)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw pokemon sprites
    getData.then(async (data) => {
      // Size and position variables
      const spriteSize = 192;
      const gap = 16;
      var x = 10;
      var y = 64;

      // Sort by pokemon id
      const pokemons = await data.sort((a, b) => a.id - b.id);

      // Test array to check if owned pokemons are colored
      const array = [8, 23, 48, 57, 58, 110, 121, 122, 139, 140, 149];

      // Preload images
      Promise.all(
        pokemons.map((pokemon) => {
          return new Promise((resolve, reject) => {
            const img = new Canvas.Image();
            img.src = pokemon.sprite;
            img.onload = resolve;
            pokemon.sprite = img;
          });
        })
      )
        .then(() => {
          // Draw pokemon sprites and names
          pokemons.map((pokemon, index) => {
            // Adjust position
            if (x + spriteSize + gap > canvas.width) {
              y += spriteSize + gap * 3.3;
              x = 10;
            } else if (index !== 0) {
              x += spriteSize + gap;
            }

            // Do you have that pokemon
            const isCaught = array.includes(pokemon.id);

            // Capitalize pokemon name
            const name = isCaught
              ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
              : "???";

            // Text settings
            ctx.font = "32px sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            // Calculate text position, needed because of textAlign
            const textPosX = x + spriteSize / 2;
            // Draw text and image
            ctx.fillText(name, textPosX, y);
            ctx.drawImage(pokemon.sprite, x, y, spriteSize, spriteSize);
            // Recolor unowned pokemons
            if (!isCaught) {
              // Recolor each pixel
              const pixels = ctx.getImageData(x, y, spriteSize, spriteSize);
              for (var i = 0; i < pixels.data.length; i += 4) {
                for (var j = 0; j < 3; j++) {
                  if (pixels.data[i + j] !== 20) {
                    pixels.data[i + j] = 5;
                  }
                }
              }
              ctx.putImageData(pixels, x, y);
            }
          });
        })
        .then(() => {
          // Text settings
          ctx.font = "100px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "end";
          ctx.textBaseline = "bottom";
          // User tag
          ctx.fillText(msg.author.tag, canvas.width - gap, canvas.height - gap);
          // Pokemon count
          ctx.fillText(
            `${array.length}/151`,
            canvas.width - gap,
            canvas.height - (100 + gap)
          );

          // Create image file
          console.log("sending");
          const attachment = new Discord.MessageAttachment(
            canvas.toBuffer(),
            "pokedex.png"
          );

          // Create embed with image attached
          const embed = new Discord.MessageEmbed()
            .setTitle("Pokédex")
            .setDescription(msg.author)
            .setColor(53380)
            .attachFiles(attachment)
            .setImage(`attachment://${attachment.name}`)
            .setThumbnail(msg.author.avatarURL());

          // Send embed
          msg.channel.send({ embed });
        });
    });
  }

  if (msg.content == PREFIX + "menu") {
    const embed = {
      title: "PokéBot Menu",
      color: 53380,
      image: {
        url: menuGUI,
      },
    };

    msg.channel.send({ embed }).then((embedMsg) => {
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      for (let i = 0; i < emojis.length; i++) {
        if (i === 5) return;
        embedMsg.react(emojis[i]);
      }
    });
  }
});

client.login(`${process.env.TOKEN}`);
