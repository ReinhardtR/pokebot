const { getUserPokemons } = require("../database");

const getPokemons = async () => {
  const pokemons = await getUserPokemons("476302464493158400");
  console.log(pokemons);
};

getPokemons();
