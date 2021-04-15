module.exports = {
  name: "pokemon",
  description:
    "Look up information about a specific pokémon, by providing its name or ID.",
  args: true,
  usage: "<id or name of a pokémon> [user-tag]",
  async execute(msg, args) {
    // List of pokemons.
    const pokemons = require("../../constants/pokemons.json");

    // The first arg of the message - should be a Pokémon name or id.
    const pokemonArg = args[0].toLowerCase();

    // Check if the arg, results in a valid Pokémon.
    const pokemon = pokemons.find(
      (pkmn) => pkmn.name === pokemonArg || pkmn.id == pokemonArg
    );

    // If there is no Pokémon found, from the provided arg, reply with a feedback message.
    if (!pokemon) {
      return msg.reply("you didn't provide a valid pokémon id or name.");
    }

    // Check if the message provides a 2nd argument, and if that arg is a user mention.
    var user = msg.author;
    if (args[1] && msg.mentions.members.size) {
      user = msg.mentions.members.first().user;
    }

    // Get the user Pokédex.
    const { getUserPokedex } = require("../../database");
    const userPokedex = await getUserPokedex(user.id);

    // If the user doesn't have a Pokédex, return an error message.
    if (!userPokedex) {
      return msg.reply("the user you mentioned doesn't have a profile.");
    }

    // If the user does have a Pokédex, check if the user has the provided Pokémon.
    const hasCaughtPokemon = userPokedex.includes(pokemon.id);

    // Require Discord.js and a function to capitalize strings.
    const Discord = require("discord.js");
    const upperCaseString = require("../../utils/upperCaseString");

    // Get image of Pokémon types.
    const pokemonTypesImage = await getImageOfPokemonTypes(pokemon.types);
    const pokemonTypesAttachment = new Discord.MessageAttachment(
      pokemonTypesImage,
      "pokemonTypes.png"
    );

    // Create an embed representing the Pokémon.
    const embed = new Discord.MessageEmbed()
      .setTitle(upperCaseString(pokemon.name))
      .setThumbnail(pokemon.sprites.front)
      .addFields(
        { name: "Rarity", value: pokemon.rarity, inline: true },
        { name: "Caught", value: hasCaughtPokemon ? "✅" : "❌", inline: true }
      )
      .attachFiles(pokemonTypesAttachment)
      .setImage(`attachment://${pokemonTypesAttachment.name}`)
      .setFooter(`ID: ${pokemon.id}`);
    msg.channel.send({ embed });
  },
};

const getImageOfPokemonTypes = async (types) => {
  // Dependencies.
  const Canvas = require("canvas");

  // Size and position variables;
  const typeWidth = 45;
  const typeHeight = 20;
  const typeGap = 5;

  // Calculate canvas width, depending on the amount of types.
  const canvasWidth = (typeWidth + typeGap) * types.length;
  const canvas = Canvas.createCanvas(canvasWidth, typeHeight);
  const ctx = canvas.getContext("2d");

  const imagesOfTypes = await Promise.all(
    types.map(async (type) => {
      const url = `https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/types/${type}.png`;
      const image = await Canvas.loadImage(url);
      return image;
    })
  );

  imagesOfTypes.forEach((typeImage, index) => {
    const posX = (typeWidth + typeGap) * index;
    const posY = 0;
    ctx.drawImage(typeImage, posX, posY, typeWidth, typeHeight);
  });

  return canvas.toBuffer();
};
