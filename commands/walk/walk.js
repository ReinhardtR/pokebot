module.exports = {
  name: "walk",
  description: "Go on a walk, and look for Pokémons!",
  args: true,
  guildOnly: true,
  usage: "<start or stop>",
  async execute(msg, args) {
    const { walks } = msg.client;
    const userWalk = walks.get(msg.author.id);
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
  const channel = await createChannel(msg);

  const spawnAmount = 1;
  const { walks } = msg.client;

  const interval = setInterval(() => {
    const pokemons = spawnPokemons(channel, spawnAmount);
    const walk = walks.get(msg.author.id);
    walk.pokemons = pokemons;
  }, 5000);

  const walkObject = {
    channel,
    interval,
    pokemons: [],
  };

  walks.set(msg.author.id, walkObject);

  channel.send(`${msg.author}, you've started walking!`);
};

const stopWalk = (msg) => {
  const { walks } = msg.client;
  const walk = walks.get(msg.author.id);
  clearInterval(walk.interval);
  walks.delete(msg.author.id);

  msg.channel.send(
    `${msg.author}, the walk has stopped, this channel will self-destruct in 4 seconds.`
  );
  setTimeout(() => {
    msg.channel.delete();
  }, 4000);
};

const getRandomPokemonEmbed = require("./utils/getRandomPokemonEmbed");

const spawnPokemons = (channel, amount) => {
  var pokemons = [];
  for (let i = 0; i < amount; i++) {
    const pokemonEmbed = getRandomPokemonEmbed();
    channel.send({ embed: pokemonEmbed.embed });
    pokemons.push(pokemonEmbed.pokemon);
  }
  return pokemons;
};
