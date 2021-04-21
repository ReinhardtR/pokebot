module.exports = {
  name: "catch",
  description: "Catch a Pokémon that has appeared in the chat!",
  args: true,
  needProfile: true,
  guildOnly: true,
  usage: "<Pokémon-name>",
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

    if (!channelWalk.members.includes(msg.author.id)) {
      return msg.reply("you're not a member of this walk.");
    }

    const { getPokeballs } = require("../../database");
    const pokeballs = await getPokeballs(msg.author.id);

    if (pokeballs <= 0) {
      return msg.reply("you do not have any pokeballs.");
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
      updateUserXP,
      updatePokeballs,
    } = require("../../database");

    // Require function that returns random Pokémon moves.
    const getPokemonMoves = require("./utils/getPokemonMoves");

    // Give pokemon to the user.
    const pokemonMoves = getPokemonMoves(pokemonInWalk.id);
    const caughtPokemon = {
      name: pokemonInWalk.name,
      id: pokemonInWalk.id,
      moves: pokemonMoves,
      xp: 0,
    };
    givePokemonToUser(msg.author.id, caughtPokemon);
    updatePokeballs(msg.author.id, -1);

    //Give user xp, relative to pokemon rarity
    const membersEffect = 1 + channelWalk.members.length * 0.2;
    const xpGain = Math.pow(pokemonToCatch.rarity, 2) * 10 * membersEffect;
    updateUserXP(msg.author.id, xpGain, msg);

    const pokemonName = toUpperCaseString(caughtPokemon.name);
    msg.reply(`you've caught **${pokemonName}**! **+${xpGain} XP**`);

    // Add to user pokedex if the pokemon is new.
    const userPokedex = await getUserPokedex(msg.author.id);
    if (!userPokedex.includes(caughtPokemon.id)) {
      userPokedex.push(caughtPokemon.id);
      userPokedex.sort((a, b) => a - b);
      updateUserPokedex(msg.author.id, userPokedex);

      //Give user xp, relative to pokemon rarity
      const xpGainNewPokemon = 100;
      updateUserXP(msg.author.id, xpGainNewPokemon, msg);

      msg.reply(
        `you've discovered a new Pokémon, **${pokemonName}** has been added to your Pokédex! **+${xpGainNewPokemon} XP**`
      );
    }
  },
};
