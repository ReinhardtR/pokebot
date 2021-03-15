// Load enviroment variables.
require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (msg.content === "yo") {
    msg.channel.send("yo");
  }
});

client.login(process.env.TOKEN);
