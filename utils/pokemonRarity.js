const pokemons = require("../constants/pokemons.json");

const initRarities = pokemons.map((pokemon) => pokemon.rarity);

const maxRarity = Math.max(...initRarities);

const newRarities = initRarities.map((rarity) => maxRarity + 1 - rarity);

const raritySum = newRarities.reduce((a, b) => a + b);

const rarityInterval = newRarities.map(
  (newRarity) => (100 / raritySum) * newRarity
);

const cumulativeSum = ((sum) => (value) => (sum += value))(0);

const cumulativeIntervals = rarityInterval.map(cumulativeSum);

const getRandomPokemon = (intervals) => {
  const getRandomNum = (min, max) => Math.random() * (max - min) + min;

  console.log(intervals);

  const num = getRandomNum(0, 151);

  for (let i = 0; i < intervals.length; i++) {
    if (num > intervals[i] && num < intervals[i + 1]) {
      console.log({
        num,
        interval: [intervals[i], intervals[i + 1]],
        pokemon: pokemons[i].name,
      });
    }
  }
};

getRandomPokemon(cumulativeIntervals);
