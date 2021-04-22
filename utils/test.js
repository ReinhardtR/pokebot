// const getPokemonTeam = async (id) => {
//   const { getUserPokemons, updateTeam, getTeam } = require("../database");

//   const firstThreePokemons = await getUserPokemons(id, 3);

//   console.log("first", firstThreePokemons);

//   firstThreePokemons.forEach((pokemon) => {
//     updateTeam(id, 0, pokemon.docId);
//   });

//   const team = await getTeam(id);
//   console.log(team);
// };

// getPokemonTeam("256891473604247554");

const power = 150;
const attack = 65;
const defense = 65;

const damage = power + (effect / 35) * power;

console.log(damage);
