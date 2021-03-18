module.exports = {
  name: "pokedex",
  description: "Get data from a user, and visualize their pokedex.",
  execute(msg, args) {
    getPokedex(msg).then((embed) => {
      msg.channel.send(embed);
    });
  },
};

function getPokedex(msg) {
  const Discord = require("discord.js");
  const Canvas = require("canvas");
  const Pokedex = require("pokedex-promise-v2");
  const P = new Pokedex();

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
  const embed = new Promise((resolve, reject) => {
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
          const pokedexEmbed = new Discord.MessageEmbed()
            .setTitle("Pokédex")
            .setDescription(msg.author)
            .setColor(53380)
            .attachFiles(attachment)
            .setImage(`attachment://${attachment.name}`)
            .setThumbnail(msg.author.avatarURL());
          resolve(pokedexEmbed);
        });
    });
  });
  return { embed };
}
