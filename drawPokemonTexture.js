async function drawPokemonTexture() {
  const fs = require("fs");

  const Canvas = require("canvas");

  const allPokemons = require("./constants/pokemons.json");

  const canvas = Canvas.createCanvas(allPokemons.length * 96, 96);

  const ctx = canvas.getContext("2d");

  const pokemonImages = await Promise.all(
    allPokemons.map(
      async (pokemon) => await Canvas.loadImage(pokemon.sprites.front)
    )
  );

  pokemonImages.forEach(async (image, index) => {
    ctx.drawImage(image, 96 * index, 0, 96, 96);
  });

  const buffer = canvas.toBuffer("image/png");

  fs.writeFileSync("./pokemons.png", buffer);
}

drawPokemonTexture();
