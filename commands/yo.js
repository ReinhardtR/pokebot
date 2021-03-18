module.exports = {
  name: "sendYo",
  description: "Test - replies with yo.",
  execute(msg, args) {
    msg.channel.send("yo");
  },
};
