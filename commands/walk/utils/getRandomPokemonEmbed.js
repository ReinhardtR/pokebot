const pokemons = require("../../../constants/pokemons.json");
const upperCaseString = require("../../../utils/upperCaseString");
const Discord = require("discord.js");

const RARITY_INFLUENCE = 1.3;

const rarities = pokemons.map((pokemon) => pokemon.rarity);
const rarityInterval = rarities.map(
  (rarity) => pokemons.length / Math.pow(RARITY_INFLUENCE, rarity)
);
const intervals = rarityInterval.map(((sum) => (value) => (sum += value))(0));

const maxRarity = intervals[intervals.length - 1];

const getRandomNum = (min, max) => Math.random() * (max - min) + min;

const getRandomPokemon = () => {
  const num = getRandomNum(0, maxRarity);

  for (let i = 0; i <= intervals.length; i++) {
    const start = intervals[i - 1] || 0;
    const end = intervals[i];
    if (num > start && num < end) {
      return pokemons[i];
    }
  }
};

const getColor = (rarity) => {
  if (rarity <= 3) {
    return "#5f6061"; // GREY
  } else if (rarity <= 6) {
    return "#3dab2c"; // GREEN
  } else if (rarity <= 9) {
    return "#05a3ff"; // BLUE
  } else if (rarity <= 14) {
    return "#d707f7"; // PURPLE
  } else if (rarity <= 18) {
    return "#f7071b"; // RED
  } else if (rarity <= 20) {
    return "#edcd2b"; // GOLD
  }
};

const getRandomPokemonEmbed = () => {
  const pokemon = getRandomPokemon();
  const name = upperCaseString(pokemon.name);
  const color = getColor(pokemon.rarity);

  const embed = new Discord.MessageEmbed()
    .setTitle(name)
    .setColor(color)
    .setImage(pokemon.sprites.front)
    .setFooter(`Rarity: ${pokemon.rarity}`);

  return {
    embed,
    pokemon: {
      name: pokemon.name,
      id: pokemon.id,
    },
  };
};

module.exports = getRandomPokemonEmbed;
