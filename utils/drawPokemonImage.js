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

const drawPokemonImage = (
  ctx,
  pokemonId,
  x,
  y,
  size = pokemonSize,
  back = false,
  clipY = 0
) => {
  const pokemonPos = {
    x: (pokemonId - 1) * pokemonSize,
    y: back ? pokemonSize : 0,
  };

  ctx.drawImage(
    pokemonImage,
    pokemonPos.x,
    pokemonPos.y,
    pokemonSize,
    pokemonSize - clipY,
    x,
    y,
    size,
    size - clipY
  );
};

module.exports = drawPokemonImage;
