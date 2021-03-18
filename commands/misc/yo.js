module.exports = {
  name: "add",
  description: "Test - replies with yo.",
  args: true,
  usage: "<pokemon-id>",
  execute(msg, args) {
    const db = require("../../firebase/database");
    db.givePokemonToUser(msg.author.id, args[0]);

    msg.channel.send(
      `I've added the Pokémon with the id of ${args[0]} to the collection of ${msg.author}`
    );
  },
};
