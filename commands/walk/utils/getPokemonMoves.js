const pokemons = require("../../../constants/pokemons.json");

const getPokemonMoves = (id) => {
  const pokemon = pokemons[id - 1];

  if (pokemon.move)

}

module.exports = getPokemonMoves;