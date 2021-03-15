require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Ready!");
});

console.log(process.env.TOKEN);

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "yo") {
    msg.channel.send("yo");
  }
});

client.login(process.env.TOKEN);
