const { getUserProfile, updatePokeballs } = require("../database");

const randomlyGivePokeBall = async (msg) => {
  const userProfile = await getUserProfile(msg.author.id);
  if (!userProfile) return;

  const randomNum = Math.random();
  console.log(randomNum);
  if (randomNum >= 0.9) {
    updatePokeballs(msg.author.id, 1);
    msg.reply("you found a **Pokéball**!");
  }
};

module.exports = randomlyGivePokeBall;
