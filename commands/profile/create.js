module.exports = {
  name: "create",
  description: "Create a profile.",
  execute(msg, args) {
    createProfile(msg);
  },
};

const createProfile = async (msg) => {
  const { getUserProfile, createUserProfile } = require("../../database");
  const profile = await getUserProfile(msg.author.id);
  if (profile) {
    msg.reply("Looks like you already have a profile.");
  } else {
    createUserProfile(msg.author.id);
    msg.reply("I've created a profile for you!");
  }
};
