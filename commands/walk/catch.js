module.exports = {
  name: "catch",
  description: "Catch a Pokémon that has appeared in the chat!",
  args: true,
  needProfile: true,
  guildOnly: true,
  usage: "<pokemon-name",
  async execute(msg, args) {
    const { walks } = msg.client;
    const channelWalk = await walks.find(
      (walk) => walk.channel.id === msg.channel.id
    );

    if (!channelWalk) {
      return msg.reply(
        "there is no walk in this channel, therefore no Pokémons!"
      );
    }

    const pokemons = require("../../constants/pokemons.json");
    const pokemonNameArg = args[0].toLowerCase();
    const pokemonToCatch = pokemons.find(
      (pokemon) => pokemon.name === pokemonNameArg
    );

    if (!pokemonToCatch) {
      return msg.reply("that is not a Pokémon, try again!");
    }

    const toUpperCaseString = require("../../utils/upperCaseString");
    const pokemonInWalk = channelWalk.pokemons.find(
      (pokemon) => pokemon.id === pokemonToCatch.id
    );

    if (!pokemonInWalk) {
      return msg.reply(
        `you're not encountering **${toUpperCaseString(
          pokemonToCatch.name
        )}** at the moment!`
      );
    }

    // Remove the pokemon from the walk.
    const index = channelWalk.pokemons.indexOf(pokemonInWalk);
    channelWalk.pokemons.splice(index, 1);

    // Require functions from database API.
    const {
      givePokemonToUser,
      getUserPokedex,
      updateUserPokedex,
    } = require("../../database");

    // Give pokemon to the user.
    const caughtPokemon = {
      ...pokemonInWalk,
      xp: 0,
      level: 1,
    };
    givePokemonToUser(msg.author.id, caughtPokemon);

    const pokemonName = toUpperCaseString(caughtPokemon.name);
    msg.reply(`you've caught **${pokemonName}**!`);

    // Add to user pokedex if the pokemon is new.
    const userPokedex = await getUserPokedex(msg.author.id);
    if (!userPokedex.includes(caughtPokemon.id)) {
      userPokedex.push(caughtPokemon.id);
      userPokedex.sort((a, b) => a - b);
      updateUserPokedex(msg.author.id, userPokedex);
      msg.reply(
        `you've discovered a new Pokémon, **${pokemonName}** has been added to your Pokédex!`
      );
    }
  },
};