module.exports = {
  name: "yo",
  description: "Test - replies with yo.",
  args: true,
  usage: "<boi>",
  execute(msg, args) {
    let reply = "yo ";

    if (args[0] === "boi") {
      reply += "boi";
    }

    msg.channel.send(reply);
  },
};
