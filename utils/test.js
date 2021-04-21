const getPokemonTeam = async (id) => {
  const { getUserPokemons, updateTeam, getTeam } = require("../database");

  const firstThreePokemons = await getUserPokemons(id, 3);

  console.log("first", firstThreePokemons);

  // firstThreePokemons.forEach((pokemon) => {
  //   updateTeam(id, 0, pokemon.docId);
  // });

  const nextThreePokemons = await getUserPokemons(
    id,
    3,
    firstThreePokemons[firstThreePokemons.length - 1]
  );

  console.log("next", nextThreePokemons);

  // const team = await getTeam(id);
  // console.log(team);
};

getPokemonTeam("476302464493158400");
