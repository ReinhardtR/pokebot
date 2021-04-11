module.exports = {
  name: "rank",
  description: "Show ranks",
  usage: "[user-tag]",
  execute(msg, args) {
    updateRanks(msg, args);
  },
};

async function updateRanks(msg, args) {}
