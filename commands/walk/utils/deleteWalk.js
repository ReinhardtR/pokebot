const deleteWalk = (msg) => {
  const { walks } = msg.client;
  const walk = walks.get(msg.author.id);
  clearInterval(walk.interval);
  walks.delete(msg.author.id);
};

module.exports = deleteWalk;
