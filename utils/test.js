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

// getPokemonTeam("223718005471838212");
