module.exports = {
  name: "create",
  description: "Create a profile.",
  execute(msg, args) {
    createProfile(msg);
  },
};

function createProfile(msg) {
  const db = require("../../database");
  const profile = db.createUserProfile(msg.author.id);
  if (profile) {
    msg.reply("I've created profile for you!");
  } else {
    msg.reply("looks like you already have a profile.");
  }
}
