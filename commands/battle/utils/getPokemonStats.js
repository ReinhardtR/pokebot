const Pokedex = require("pokedex-promise-v2");
const P = new Pokedex();

const getPokemonStats = async (pokemonId, pokemonLvl) => {
  const pokemonData = await P.resource(`api/v2/pokemon/${pokemonId}`);

  const wantedStatsNames = ["hp", "attack", "defense"];
  const wantedStats = pokemonData.stats.filter((stat) =>
    wantedStatsNames.includes(stat.stat.name)
  );

  const pokemonStats = {};
  wantedStats.forEach((stat) => {
    Object.defineProperty(pokemonStats, stat.stat.name, {
      value: Math.floor(stat.base_stat + pokemonLvl * (stat.base_stat / 50)),
    });
  });

  return pokemonStats;
};

module.exports = getPokemonStats;
