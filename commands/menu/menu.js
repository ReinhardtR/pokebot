module.exports = {
  name: "menu",
  description: "Open the GUI menu",
  execute(msg, args) {
    openMenuGUI(msg);
  },
};

function openMenuGUI(msg) {
  const menuGUI = "https://i.imgur.com/Sx2mQTH.png";
  const embed = {
    title: "PokéBot Menu",
    color: 53380,
    image: {
      url: menuGUI,
    },
  };

  msg.channel.send({ embed }).then((embedMsg) => {
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    const reacts = emojis.map((emoji, index) => {
      if (index >= 5) return;
      embedMsg.react(emoji);
    });
    Promise.all(reacts).then(() => {
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
            msg.reply("pogU");
          } else {
            msg.reply("sadge");
          }
        });
    });
  });
}

function menuPlayerProfile(msg) {
  const commandEmbed = {
    plainText: "test",
    description: "A complete list of all player profile commands!",
    author: {
      name: "Player Profile Commands",
    },
    color: 53380,
  };
}
