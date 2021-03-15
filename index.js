require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const PREFIX = "p!";
const menuGUI = "https://i.imgur.com/Sx2mQTH.png";

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "yo") {
    msg.channel.send("yo");
  }
});

client.on("message", (message) => {
  if (message.content == PREFIX + "menu") {
    const embed = {
      title: "PokéBot Menu",
      color: 53380,
      image: {
        url: menuGUI,
      },
    };

    message.channel.send({ embed: embed }).then((embedMessage) => {
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      for (let i = 0; i < emojis.length; i++) {
        if (i == 5) return;
        embedMessage.react(emojis[i]);
      }
    });
  }
});

client.login(`${process.env.TOKEN}`);
