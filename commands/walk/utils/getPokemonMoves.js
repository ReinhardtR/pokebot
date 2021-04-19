const pokemons = require("../../../constants/pokemons.json");

const getPokemonMoves = (id) => {
  const { moves } = pokemons[id - 1];

  if (moves.length > 4) {
    return Array(4)
      .fill(0)
      .map(() => moves[Math.floor(Math.random() * moves.length)]);
  } else {
    return moves;
  }
};

module.exports = getPokemonMoves;
