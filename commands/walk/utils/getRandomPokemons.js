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
  const colorArray = [
    "#5F6061",
    "#5C6D5C",
    "#587957",
    "#508C4C",
    "#479C3E",
    "#3DAB2C",
    "#2BA7BE",
    "#1EA5E2",
    "#05A3FF",
    "#5399FE",
    "#738FFD",
    "#9E77FB",
    "#BD56F9",
    "#D707F7",
    "#E007DA",
    "#E807B7",
    "#F00787",
    "#F7071B",
    "#F29624",
    "#EDCD2B",
    "#EDCD2B",
  ];
  return colorArray[rarity];
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
