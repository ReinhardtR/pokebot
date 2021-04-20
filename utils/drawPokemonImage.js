const { loadImage } = require("canvas");

const loadPokemonImage = async () =>
  await loadImage(
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pokemon.png"
  );

var pokemonImage;
loadPokemonImage().then((image) => {
  pokemonImage = image;
});

const pokemonSize = 96;

console.log(pokemonImage);

const drawPokemonImage = (ctx, pokemonId, x, y, size = 96) => {
  const pokemonPos = {
    x: (pokemonId - 1) * pokemonSize,
    y: 0,
  };

  ctx.drawImage(
    pokemonImage,
    pokemonPos.x,
    pokemonPos.y,
    pokemonSize,
    pokemonSize,
    x,
    y,
    size,
    size
  );
};

module.exports = drawPokemonImage;
