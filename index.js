const config = require("./config.json");
const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "yo") {
    msg.channel.send("yo");
  }
});

client.login(config.token || process.env.TOKEN);
