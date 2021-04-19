const { loadImage } = require("canvas");

const loadPokemonImage = async () => await loadImage("../images/pokemon.png");

var pokemonImage;
loadPokemonImage().then((image) => {
  pokemonImage = image;
});

const pokemonSize = 96;

console.log(pokemonImage);

const drawPokemonImage = (ctx, pokemonId, x, y) => {
  const pokemonPos = {
    x: (pokemonId - 1) * pokemonSize,
    y: 0,
  };

  console.log(pokemonImage);

  ctx.drawImage(
    pokemonImage,
    pokemonPos.x,
    pokemonPos.y,
    pokemonSize,
    pokemonSize,
    x,
    y,
    pokemonSize,
    pokemonSize
  );
};

module.exports = drawPokemonImage;
