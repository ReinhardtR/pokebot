// const Pokedex = require("pokedex-promise-v2");
// const P = new Pokedex();
// const pokemonsData = require("../constants/pokemons.json");

// const getData = async () => {
//   const newPokemonData = await Promise.all(
//     pokemonsData.map(async (pokemon) => {
//       const pokemonData = await P.resource(`api/v2/pokemon/${pokemon.name}`);

//       const pokemonTypes = pokemonData.types.map(({ type }) => {
//         return type.name;
//       });

//       return { ...pokemon, types: pokemonTypes };
//     })
//   );

//   const fs = require("fs");

//   const json = JSON.stringify(newPokemonData);

//   fs.writeFile("pokemons2.json", json, "utf8", () => {});
// };

// getData();
