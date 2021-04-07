const getRandomPokemonEmbed = require("./getRandomPokemonEmbed");

const spawnPokemons = (channel, amount) => {
  var pokemons = [];
  for (let i = 0; i < amount; i++) {
    const pokemonEmbed = getRandomPokemonEmbed();
    channel.send({ embed: pokemonEmbed.embed });
    pokemons.push(pokemonEmbed.pokemon);
  }
  return pokemons;
};

const createWalk = (msg, spawnAmount) => {
  const { walks } = msg.client;
  const interval = setInterval(() => {
    const pokemons = spawnPokemons(msg.channel, spawnAmount);
    const walk = walks.get(msg.author.id);
    walk.pokemons = pokemons;
  }, 5000);
  const walkObject = {
    channel: {
      name: msg.channel.name,
      id: msg.channel.id,
    },
    interval,
    pokemons: [],
  };

  walks.set(msg.author.id, walkObject);
};

module.exports = createWalk;
