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

client.on("message", (msg) => {
  if (msg.content == PREFIX + "menu") {
    const embed = {
      title: "PokéBot Menu",
      color: 53380,
      image: {
        url: menuGUI,
      },
    };

    msg.channel.send({ embed }).then((embedMsg) => {
      const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
      for (let i = 0; i < emojis.length; i++) {
        if (i === 5) return;
        embedMsg.react(emojis[i]);
      }
    });
  }
});

client.login(`${process.env.TOKEN}`);
