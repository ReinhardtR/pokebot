const getPokemonStyles = (pokemonSize) => ({
  player1: {
    pokemon: {
      x: 100 - pokemonSize / 2,
      y: 138,
      size: 128,
      showBack: true,
      clipY: 45,
    },
    box: {
      x: 25,
      y: 60,
    },
    moves: {
      x: 0,
      y: 225,
    },
  },
  player2: {
    pokemon: {
      x: 300 - pokemonSize / 2,
      y: 60,
      size: 100,
      showBack: false,
      clipY: 0,
    },
    box: {
      x: 230,
      y: 150,
    },
    moves: {
      x: 0,
      y: 5,
    },
  },
});

module.exports = getPokemonStyles;
