module.exports = {
  name: "yo",
  description: "Test - replies with yo.",
  async execute(msg, args) {
    const { getUserPokemons } = require("../../database");
    console.log(await getUserPokemons(msg.author.id));
  },
};
