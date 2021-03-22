module.exports = {
  name: "create",
  description: "Create a profile.",
  execute(msg, args) {
    const db = require("../../database");
    db.createUserProfile(msg.author.id);

    msg.channel.send(`I've created profile for you ${msg.author}`);
  },
};
