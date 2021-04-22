const getPokemonStyles = (pokemonSize) => ({
  player1: {
    pokemon: {
      x: 100 - pokemonSize / 2,
      y: 100,
      size: 128,
      showBack: true,
      clipY: 45,
    },
    box: {
      x: 25,
      y: 15,
    },
  },
  player2: {
    pokemon: {
      x: 300 - pokemonSize / 2,
      y: 30,
      size: 100,
      showBack: false,
      clipY: 0,
    },
    box: {
      x: 230,
      y: 120,
    },
  },
});

module.exports = pokemonStyles;
