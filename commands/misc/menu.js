module.exports = {
  name: "menu",
  description:
    "Open a menu, that will help you navigate through diffrent commands.",
  execute(msg, args) {
    sendMenu(msg, args);
  },
};

function sendMenu(msg, args) {
  const Discord = require("discord.js");

  const menuGUI =
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/PokemonMenu.png";
  const embed = new Discord.MessageEmbed()
    .setTitle("Pokébot Menu")
    .setColor(53380)
    .setImage(menuGUI);

  msg.channel.send({ embed }).then((embedMsg) => {
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    const reacts = async () => {
      for (let i = 0; i < emojis.length; i++) {
        if (i === 5) return;
        embedMsg.react(emojis[i]);
      }
    };

    reacts().then(() => {
      // Awaiting reactions
      const filter = (reaction, user) => {
        const included = [
          "1️⃣",
          "2️⃣",
          "3️⃣",
          "4️⃣",
          "5️⃣",
          "6️⃣",
          "7️⃣",
          "8️⃣",
          "9️⃣",
        ].includes(reaction.emoji.name);
        const id = msg.author.id === user.id;
        return included && id;
      };

      embedMsg
        .awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
        .then(async (collected) => {
          const reaction = collected.first();
          embedMsg.reactions.removeAll();

          function runCommand(path) {
            const command = require(path);
            command.execute();
            embedMsg.delete();
          }

          if (reaction.emoji.name === "1️⃣") {
            menuWalk(embedMsg, msg);
          } else if (reaction.emoji.name === "3️⃣") {
            playerProfileMenu(embedMsg, msg);
          } else if (reaction.emoji.name === "4️⃣") {
            runCommand("../profile/pokedex");
          } else if (reaction.emoji.name === "") {
            runCommand("../misc/help");
          } else {
            msg.reply("sadge");
          }
        });
    });
  });
}

function menuWalk(botMsg, userMsg) {
  const walkEmbed = {
    description:
      userMsg.author.toString() +
      " here is a complete list of all walk commands!",
    author: {
      name: "Walk Commands",
    },
    color: 53380,
  };
  botMsg.edit({ embed: walkEmbed });
}

function playerProfileMenu(botMsg, userMsg) {
  const Discord = require("discord.js");

  //const menuGUI =
  // "<playerprofile menu here>";
  const profileEmbed = new Discord.MessageEmbed()
    .setTitle("Profile Menu")
    .setDescription(userMsg.author.toString() + "'s Player profile")
    .setColor(53380);
  //.setImage(menuGUI);

  botMsg.edit({ embed: profileEmbed });
}
