module.exports = {
  name: "menu",
  description: "Open the GUI menu",
  execute(msg, args) {
    openMenuGUI(msg);
  },
};

// Awaiting reactions
const filter = (reaction, user) => {
  return (
    ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"].includes(
      reaction.emoji.name
    ) && user.id === msg.author.id
  );
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
    for (let i = 0; i < emojis.length; i++) {
      if (i === 5) return;
      embedMsg.react(emojis[i]);
    }
    embedMsg
      .awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
      .then((collected) => {
        const reaction = collected.first();
        console.log(reaction.emoji.name);

        if (reaction.emoji.name === "1️⃣") {
          msg.reply("pogU");
        } else {
          msg.reply("sadge");
        }
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
