const {
  incrementUserPokemonCount,
  getUserPokemonCount,
  getUserPokemons,
} = require("../database");

const incrementCount = () => {
  incrementUserPokemonCount("476302464493158400", -5);
};

incrementCount();

const getCount = async () => {
  const count = await getUserPokemonCount("476302464493158400");
  console.log(count);
};

getCount();

// const getPokemons = async () => {
//   const pokemons = await getUserPokemons("476302464493158400");
//   console.log(pokemons, pokemons.length);
// };

// getPokemons();
