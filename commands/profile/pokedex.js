module.exports = {
  name: "pokedex",
  description: "See what Pokémons, you or someone else has caught.",
  usage: "[user-tag]",
  execute(msg, args) {
    var user = msg.author;
    if (msg.mentions.members.size) {
      user = msg.mentions.members.first().user;
    }
    sendPokedex(msg, user);
  },
};

async function sendPokedex(msg, user) {
  const db = require("../../database");
  const userPokedex = await db.getUserPokedex(user.id);

  if (!userPokedex) {
    return msg.reply(
      `it looks like ${user} doesn't have a profile. Encourage him to create one!`
    );
  }

  const Discord = require("discord.js");
  const Canvas = require("canvas");
  const pokemons = require("../../constants/pokemons.json");

  // Create canvas
  const canvas = Canvas.createCanvas(2500, 3200);
  const ctx = canvas.getContext("2d");

  // Draw background color
  ctx.fillStyle = "rgb(20,20,20)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw pokemon sprites
  // Size and position variables
  const spriteSize = 192;
  const gap = 16;
  var x = 10;
  var y = 64;

  // Preload images
  Promise.all(
    pokemons.map((pokemon) => {
      return new Promise((resolve, reject) => {
        const img = new Canvas.Image();
        img.src = pokemon.sprites.front;
        img.onload = resolve;
        pokemon.sprite = img;
      });
    })
  )
    .then(() => {
      // Draw pokemon sprites and names
      pokemons.map(async (pokemon, index) => {
        // Adjust position
        if (x + spriteSize + gap > canvas.width) {
          y += spriteSize + gap * 3.3;
          x = 10;
        } else if (index !== 0) {
          x += spriteSize + gap;
        }

        // Do you have that pokemon
        const isCaught = userPokedex ? userPokedex.includes(pokemon.id) : false;

        // Capitalize pokemon name
        const upperCaseString = require("../../utils/upperCaseString");
        const name = isCaught ? upperCaseString(pokemon.name) : "???";

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
      ctx.fillText(user.tag, canvas.width - gap, canvas.height - gap);
      // Pokemon count
      ctx.fillText(
        `${userPokedex.length}/151`,
        canvas.width - gap,
        canvas.height - (100 + gap)
      );

      // Create image file
      const attachment = new Discord.MessageAttachment(
        canvas.toBuffer(),
        "pokedex.png"
      );

      // Create embed with image attached
      const embed = new Discord.MessageEmbed()
        .setTitle("Pokédex")
        .setDescription(user)
        .setColor(53380)
        .attachFiles(attachment)
        .setImage(`attachment://${attachment.name}`)
        .setThumbnail(user.avatarURL());

      msg.channel.send({ embed });
    });
}
