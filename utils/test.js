const getPokemonTeam = async () => {
  const { getUserPokemons, updateTeam, getTeam } = require("../database");

  const firstThreePokemons = await getUserPokemons("476302464493158400", 3);

  firstThreePokemons.forEach((pokemon) => {
    updateTeam("476302464493158400", 0, pokemon.docId);
  });

  const team = await getTeam("476302464493158400");
  console.log(team);
};

getPokemonTeam();
