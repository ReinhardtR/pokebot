const getLevel = (xp) => {
  return Math.floor(0.2147300748 * Math.pow(xp, 1 / 3));
};

const getXPNeeded = (level) => {
  return Math.pow(level, 3) + 2 * Math.pow(level, 3) * 50;
};

const getXPDisplayed = (xp) => {
  var levels = [];
  for (var i = 0; i < getLevel(xp); i++) {
    levels.push(getXPNeeded(i));
  }
  console.log(levels.reduce((a, b) => a + b, 0));
  return col;
};

module.exports = { getXPNeeded, getLevel, getXPDisplayed };
