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

          async function runCommand(path) {
            const command = require(path);
            await command.execute(msg);
            embedMsg.delete();
          }

          switch (reaction.emoji.name) {
            case "1️⃣":
              runCommand("./walkMenu");
              break;
            case "2️⃣":
              console.log("Arena");
              break;
            case "3️⃣":
              runCommand("../profile/profile");
              break;
            case "4️⃣":
              runCommand("../profile/pokedex");
              break;
            case "5️⃣":
              runCommand("../misc/help");
              break;
            default:
              console.log("Sadge");
          }
        })
        .catch((e) => {
          embedMsg.delete();
        });
    });
  });
}
