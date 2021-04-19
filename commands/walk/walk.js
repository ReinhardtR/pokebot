module.exports = {
  name: "walk",
  description: "Creates a private channel, for finding Pokémon!",
  args: true,
  usage: "<start or stop>",
  guildOnly: true,
  async execute(msg, args) {
    const { walks } = msg.client;

    // Check if the user is a member of a walk.
    const userWalk =
      walks.get(msg.author.id) ||
      (await walks.find((walk) => walk.members.includes(msg.author.id)));

    // Check if there is a walk in the channel of the message, and get a reference to it.
    const channelWalk = await walks.find(
      (walk) => walk.channel.id === msg.channel.id
    );

    if (args[0] === "start") {
      if (userWalk) {
        msg.reply(
          `you're already on a walk in ${userWalk.channel.toString()}.`
        );
      } else if (channelWalk) {
        msg.reply(`there is already a walk in this channel.`);
      } else {
        startWalk(msg);
      }
    } else if (args[0] === "stop") {
      if (userWalk) {
        stopWalk(msg);
      } else {
        msg.reply("you're not currently on a walk.");
      }
    }
  },
};

const createChannel = async (msg) => {
  const everyoneRole = msg.guild.roles.everyone;

  const name = `${msg.author.username}'s walk`;
  const channel = await msg.guild.channels.create(name, {
    type: "text",
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: ["VIEW_CHANNEL"],
      },
      {
        id: msg.author.id,
        allow: ["VIEW_CHANNEL"],
      },
    ],
  });
  return channel;
};

const startWalk = async (msg) => {
  // Dependencies
  const Discord = require("discord.js");
  const Canvas = require("canvas");
  const drawPokemonImage = require("../../utils/drawPokemonImage");
  const getRandomPokemons = require("./utils/getRandomPokemons");
  const upperCaseString = require("../../utils/upperCaseString");

  // Create a channel, where the walk is taking place.
  const channel = await createChannel(msg);

  // Reference to the walks collection.
  const { walks } = msg.client;

  // Function to spawn a pokemon, send an embed and update the array of pokemons in the walk.
  const spawnPokemon = async () => {
    const walk = await walks.get(msg.author.id);
    const spawnAmount = Math.floor(walk.members.length * 1.5);

    // Get a list of random pokemons.
    const pokemons = getRandomPokemons(spawnAmount);

    // Canvas pokemon position constants.
    const pokemonSize = 96;
    const pokemonGap = 16;
    const canvasWidth = pokemonGap + (pokemonGap + pokemonSize) * spawnAmount;

    // Create canvas for the pokemon to be drawn on.
    const canvas = Canvas.createCanvas(canvasWidth, 128);
    const ctx = canvas.getContext("2d");

    // Draw the pokemon on the canvas.
    pokemons.forEach((pokemon, index) => {
      // Draw the pokémon sprite.
      const pokemonPos = {
        x: pokemonGap + (pokemonGap + pokemonSize) * index,
        y: pokemonGap * 2,
      };
      drawPokemonImage(ctx, pokemon.id, pokemonPos.x, pokemonPos.y);

      // Text style settings.
      ctx.textAlign = "center";

      // Draw pokémon name.
      const namePos = {
        x: pokemonPos.x + pokemonSize / 2,
        y: pokemonGap * 2,
      };
      ctx.font = "bold 16px Sans-Serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(upperCaseString(pokemon.name), namePos.x, namePos.y);

      // Draw pokémon rarity.
      const rarityPos = {
        x: namePos.x,
        y: pokemonSize + pokemonGap * 2,
      };
      ctx.font = "bold 14px Sans-Serif";
      ctx.fillStyle = pokemon.rarity.color;
      ctx.fillText(pokemon.rarity.tier, rarityPos.x, rarityPos.y);
    });

    // Get the color of the pokemon with the highest rarity.
    var highestRarityColor;
    if (spawnAmount > 1) {
      highestRarityColor = pokemons.sort(
        (a, b) => b.rarity.tier - a.rarity.tier
      )[0].rarity.color;
    } else {
      highestRarityColor = pokemons[0].rarity.color;
    }

    // Create a Discord message attachment of the canvas.
    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "spawnedPokemons.png"
    );

    // Create a Discord embed and send the message.
    const embed = new Discord.MessageEmbed()
      .setTitle("Pokémon")
      .setColor(highestRarityColor)
      .attachFiles(attachment)
      .setImage(`attachment://${attachment.name}`);
    await channel.send({ embed });

    // Add the pokémon to the walk, so they are catchable.
    walk.pokemons = pokemons.map((pokemon) => ({
      name: pokemon.name,
      id: pokemon.id,
    }));
  };

  // Create a walk object, and set it in the walks-collection.
  const walkObject = {
    channel,
    members: [msg.author.id],
    pokemons: [],
    interval: setInterval(spawnPokemon, 8000),
  };
  walks.set(msg.author.id, walkObject);

  // Set the topic of the created channel.
  channel.setTopic(`Members: **1**`);

  // Send a notification to the user, in the created channel.
  channel.send(`${msg.author}, you've started walking!`);
};

const stopWalk = (msg) => {
  // Get a reference to the users walk.
  const { walks } = msg.client;
  const walk = walks.get(msg.author.id);

  // Clear the interval spawning pokemons.
  clearInterval(walk.interval);

  // Send a notification to the user.
  msg.reply(
    `your walk in ${walk.channel.toString()} has been stopped. The channel will be deleted in 4 seconds.`
  );

  // Set a timeout, that will delete the channel in 4 seconds.
  setTimeout(() => {
    walk.channel.delete();
  }, 4000);

  // Delete the walk.
  walks.delete(msg.author.id);
};
