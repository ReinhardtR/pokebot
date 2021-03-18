module.exports = {
  name: "sendMenuGUI",
  description: "Open the GUI menu",
  execute(msg, args) {
    openMenuGUI(msg);
  },
};

function openMenuGUI(msg) {
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
