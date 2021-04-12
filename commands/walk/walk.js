module.exports = {
  name: "walk",
  description: "Creates a private channel, for finding pokémon!",
  args: true,
  usage: "<start or stop>",
  guildOnly: true,
  async execute(msg, args) {
    const { walks } = msg.client;
    const userWalk =
      walks.get(msg.author.id) ||
      (await walks.find((walk) => walk.members.includes(msg.author.id)));
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
      if (userWalk && !channelWalk) {
        msg.reply(
          `you're not on a walk in this channel. You're walking in ${userWalk.channel.toString()}.`
        );
      } else if (!userWalk) {
        msg.reply("you're not currently on a walk.");
      } else {
        stopWalk(msg);
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
  const getRandomPokemons = require("./utils/getRandomPokemons");
  const Discord = require("discord.js");
  const Canvas = require("canvas");
  const channel = await createChannel(msg);

  const { walks } = msg.client;

  const spawnPokemon = async () => {
    const walk = await walks.get(msg.author.id);
    const spawnAmount = walk.members.length;
    // Get a list of random pokemons.
    const pokemons = await getRandomPokemons(spawnAmount);

    // Create canvas for the pokemons to be visualized on.
    const pokemonWidth = 100;
    const canvas = Canvas.createCanvas(pokemonWidth * spawnAmount, 128);
    const ctx = canvas.getContext("2d");

    // Draw the pokemons on the canvas.
    pokemons.forEach((pokemon, index) => {
      ctx.drawImage(pokemon.sprite, 100 * index, 16);
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

  const walkObject = {
    channel,
    members: [msg.author.id],
    pokemons: [],
    interval: setInterval(spawnPokemon, 5000),
  };

  walks.set(msg.author.id, walkObject);

  channel.setTopic(
    `**Members**: 1 - **Interval**: 8000 ms - **Catchable**: last 1`
  );
  channel.send(`${msg.author}, you've started walking!`);
};

const stopWalk = (msg) => {
  const { walks } = msg.client;
  const walk = walks.get(msg.author.id);
  clearInterval(walk.interval);
  walks.delete(msg.author.id);

  msg.reply(
    "the walk has stopped, this channel will self-destruct in 4 seconds."
  );
  setTimeout(() => {
    msg.channel.delete();
  }, 4000);
};
