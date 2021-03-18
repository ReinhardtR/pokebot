module.exports = {
  name: "yo",
  description: "Test - replies with yo.",
  execute(msg, args) {
    msg.channel.send("yo");
  },
};
