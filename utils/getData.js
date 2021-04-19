const Pokedex = require("pokedex-promise-v2");
var options = {
  timeout: 6 * 20000,
};
const P = new Pokedex(options);
const pokemonsData = require("../constants/pokemons.json");

const getMoves = async (pokemonId) => {
  const pokemon = await P.resource(`api/v2/pokemon/${pokemonId}`);

  const pokemonMoves = await Promise.all(
    pokemon.moves.map(async (pokemonMove) => {
      const move = await P.resource(pokemonMove.move.url);

      return {
        name: move.name,
        accuracy: move.accuracy,
        power: move.power,
        generation: move.generation.name,
        category: move.meta.category.name,
      };
    })
  );

  const generations = [
    "generation-i",
    "generation-ii",
    "generation-iii",
    "generation-iv",
    "generation-v",
    "generation-vi",
    "generation-vii",
    "generation-viii",
  ];

  var gen = 1;
  var validMoves = [];

  while (validMoves.length <= 4) {
    const newValidMoves = pokemonMoves.filter(
      (move) =>
        move &&
        move.accuracy &&
        move.power &&
        move.generation == generations[gen - 1] &&
        move.category == "damage"
    );

    validMoves.push(newValidMoves);
    gen += 1;
  }

  return validMoves;
};

const writePokemonFile = async () => {
  function timeOut(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  var promises = [];

  for (const pokemon of pokemonsData) {
    const moves = await getMoves(pokemon.id);
    promises.push({ ...pokemon, moves });
    await timeOut(1000);
    console.log("Pokemon: " + pokemon.id, "moves: " + moves.length);
  }

  const newPokemonData = await Promise.all(promises);

  console.log(newPokemonData);

  const json = JSON.stringify(newPokemonData);
  fs.writeFile("pokemons.json", json, "utf8", () => {});
};

writePokemonFile();
