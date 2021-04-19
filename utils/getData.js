const Pokedex = require("pokedex-promise-v2");
const P = new Pokedex();
const pokemonsData = require("../constants/pokemons.json");

const getMoves = async () => {
  const pokemon = await P.resource(`api/v2/pokemon/${150}`);

  const pokemonMoves = await Promise.all(
    pokemon.moves.map(async (pokemonMove) => {
      const move = await P.resource(pokemonMove.move.url);

      if (
        move.generation.name == "generation-i" &&
        move.meta.category.name == "damage" &&
        move.power &&
        move.accuracy
      ) {
        return {
          name: move.name,
          accuracy: move.accuracy,
          power: move.power,
        };
      }
    })
  );

  const validMoves = pokemonMoves.filter((move) => move);

  return validMoves;
};

getData();
