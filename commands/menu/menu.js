module.exports = {
  name: "menu",
  description: "Open the GUI menu",
  execute(msg, args) {
    openMenuGUI(msg);
  },
};

function openMenuGUI(msg) {
  const menuGUI =
    "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/PokemonMenu.png";
  const embed = {
    title: "PokéBot Menu",
    color: 53380,
    image: {
      url: menuGUI,
    },
  };

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
        .then((collected) => {
          const reaction = collected.first();

          if (reaction.emoji.name === "1️⃣") {
            embedMsg.reactions.removeAll();
            menuWalk(embedMsg, msg);
          } else if (reaction.emoji.name === "4️⃣") {
            embedMsg.reactions.removeAll();
            const pokedex = require("../profile/pokedex");
            pokedex.execute(msg);
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
