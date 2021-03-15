const dotenv = require("dotenv");
const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Ready!");
});

client.login("ODIwOTQwMzQwMjM5Nzk0MTc2.YE8eRQ.2tu1YTTc1jue4QmIyLE-_nCrwcw");
