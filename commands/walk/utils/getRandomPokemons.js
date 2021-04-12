const { loadImage } = require("canvas");
const pokemons = require("../../../constants/pokemons.json");

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

const getRandomPokemons = async (amountOfPokemon) => {
  const array = new Array(amountOfPokemon).fill(undefined);

  console.log("started loading");
  const randomPokemons = await Promise.all(
    array.map(async () => {
      const pokemon = getRandomPokemon();
      const color = getColor(pokemon.rarity);
      const sprite = await loadImage(pokemon.sprites.front);

      return {
        name: pokemon.name,
        id: pokemon.id,
        sprite,
        rarity: {
          tier: pokemon.rarity,
          color,
        },
      };
    })
  );

  return randomPokemons;
};

module.exports = getRandomPokemons;
