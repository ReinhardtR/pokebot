const getLevel = (xp) => {
  var colXP = 0;
  var index = 1;
  dance: while (xp > 0) {
    colXP += getXPNeeded(index);
    if (xp - colXP < 0) {
      break dance;
    } else {
      xp -= colXP;
    }
    index++;
  }
  const level = Math.floor(0.2147300748 * Math.pow(colXP, 1 / 3));
  return level;
};

const getXPNeeded = (level) => {
  return Math.pow(level, 3) + 2 * Math.pow(level, 3) * 50;
};

const getXPDisplayed = (xp) => {
  var colXP = 0;
  var t = 1;
  while (xp > 0) {
    colXP += getXPNeeded(t);
    if (xp - colXP < 0) {
      return xp;
    } else {
      xp -= colXP;
    }
    t++;
  }
};

module.exports = { getXPNeeded, getLevel, getXPDisplayed };
