module.exports = {
  name: "pokemon",
  description:
    "Look up information about a specific pokémon, by providing its id or name.",
  args: true,
  usage: "<id or name of a pokémon>",
  execute(msg, args) {
    const pokemons = require("../../constants/pokemons.json");

    const pokemonArg = args[0].toLowerCase();

    const pokemonToCheck = pokemons.find(
      (pokemon) => pokemon.name === pokemonArg || pokemon.id === pokemonArg
    );

    if (!pokemonToCheck) {
      return msg.reply("you didn't provide a valid Pokémon ID or name.");
    }

    const {getUserPokedex} = require("../../database");

    const userPokedex = await getUserPokedex(msg.author.id);
    const hasCaughtPokemon = userPokedex.includes(caughtPokemon.id);


  },
};
