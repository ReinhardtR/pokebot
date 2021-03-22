const Pokedex = require("pokedex-promise-v2");
const P = new Pokedex();

const getData = new Promise(async (resolve, reject) => {
  const data = [];
  for (let i = 1; i <= 151; i++) {
    await P.resource(`api/v2/pokemon/${i}`).then((pokemon) => {
      console.log(pokemon.name, pokemon.id);
      data.push({
        name: pokemon.name,
        id: pokemon.id,
        sprites: {
          front: pokemon.sprites.front_default,
          back: pokemon.sprites.back_default,
        },
      });
    });
  }
  return resolve(Promise.all(data));
});

getData.then((pokemons) => {
  const fs = require("fs");

  const json = JSON.stringify(pokemons);

  fs.writeFile("pokemons.json", json, "utf8", () => {});
});
