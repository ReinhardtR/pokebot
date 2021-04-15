module.exports = {
  name: "pokemon",
  description:
    "Look up information about a specific pokémon, by providing its name or ID.",
  args: true,
  usage: "<id or name of a pokémon>",
  async execute(msg, args) {
    // List of pokemons.
    const pokemons = require("../../constants/pokemons.json");

    // The first arg of the message - should be a Pokémon name or id.
    const pokemonArg = args[0].toLowerCase();

    // Check if the arg, results in a valid Pokémon.
    const pokemon = pokemons.find(
      (pkmn) => pkmn.name === pokemonArg || pkmn.id === pokemonArg
    );

    // If there is no Pokémon found, from the provided arg, reply with a feedback message.
    if (!pokemon) {
      return msg.reply("you didn't provide a valid pokémon id or name.");
    }

    // Dependencies.
    const Discord = require("discord.js");
    const { getUserPokedex } = require("../../database");
    const upperCaseString = require("../../utils/upperCaseString");

    // Check if the user typing the command, has that Pokémon in his pokedex.
    const userPokedex = await getUserPokedex(msg.author.id);
    const hasCaughtPokemon = userPokedex.includes(pokemon.id);

    // Get image of Pokémon types.
    const pokemonTypes = getImageOfPokemonTypes(pokemon.types);

    // Create an embed representing the Pokémon.
    const embed = new Discord.MessageEmbed()
      .setTitle(upperCaseString(pokemon.name))
      .setThumbnail(pokemon.sprites.front)
      .addFields({ name: "Rarity", value: pokemon.rarity })
      .setFooter(`ID: ${pokemon.id}`);
    msg.channel.send({ embed });
  },
};

function getImageOfPokemonTypes(types) {
  const Canvas = require("canvas");

  const canvasWidth = 90 * types.length;

  const canvas = Canvas.createCanvas(canvasWidth, 40);
}
