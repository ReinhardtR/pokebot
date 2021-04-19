const {
  incrementUserPokemonCount,
  getUserPokemonCount,
} = require("../database");

const incrementCount = () => {
  incrementUserPokemonCount("476302464493158400");
};

incrementCount();

const getCount = async () => {
  console.log(await getUserPokemonCount("476302464493158400"));
};

getCount();
