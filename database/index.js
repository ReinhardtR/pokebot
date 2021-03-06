const firebase = require("firebase");

firebase.initializeApp({
  apiKey: `${process.env.FIREBASE_KEY}`,
  authDomain: "pokebot-5b452.firebaseapp.com",
  projectId: "pokebot-5b452",
  storageBucket: "pokebot-5b452.appspot.com",
  messagingSenderId: "596793676901",
  appId: "1:596793676901:web:5434dcd558a5f40337a28c",
});

const db = firebase.firestore();

// User Profile
const createUserProfile = (userId) => {
  const userRef = db.collection("users").doc(userId);
  if (userRef.exists) return;
  userRef.set({
    xp: 0,
    pokedex: [],
    trainer:
      "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer1.png",
    buddy: 0,
    pokemonCount: 0,
    pokeballs: 10,
    team: [],
  });
};

const getUserProfile = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  return userDoc.data();
};

// Pokemon Count
const updateUserPokemonCount = (userId, amount) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    pokemonCount: firebase.firestore.FieldValue.increment(amount),
  });
};

const getUserPokemonCount = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  return userDoc.data().pokemonCount;
};

// User Pokemon
const givePokemonToUser = (userId, pokemon) => {
  const userRef = db.collection("users").doc(userId);
  userRef.collection("pokemons").add(pokemon);
};

const getUserPokemons = async (
  userId,
  limit = 20,
  value = "name",
  order = "desc",
  lastDoc = undefined
) => {
  const pokemonsRef = db.collection("users").doc(userId).collection("pokemons");

  var startValue = lastDoc && lastDoc[value];

  if (!startValue) {
    if (typeof value == "string") {
      startValue = order == "desc" ? "zzz" : "aaa";
    } else if (typeof value == "number") {
      startValue = order == "desc" ? Infinity : 0;
    }
  }

  const snapshot = await pokemonsRef
    .orderBy(value, order)
    .startAt(startValue)
    .limit(limit)
    .get();

  const pokemons = snapshot.docs.map((doc) => ({
    docId: doc.id,
    ...doc.data(),
  }));

  return pokemons;
};

// User Pokedex
const updateUserPokedex = (userId, pokedexArray) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    pokedex: pokedexArray,
  });
};

const getUserPokedex = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  return userDoc.data().pokedex;
};

// User XP
const updateUserXP = async (userId, xpGain, channel, userTag) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userXP = userDoc.data().xp;

  // Record old level
  const { getLevel } = require("../commands/profile/utils/levelAndXP");
  const oldLevel = getLevel(userXP);

  // Get ref and update xp
  const updatedXP = userXP + xpGain;
  userRef.update({
    xp: updatedXP,
  });

  // Define new level (has to be userDoc.xp to get new xp)
  const level = getLevel(updatedXP);
  if (oldLevel != level) {
    const pokeballReward = level * 10;
    updatePokeballs(userId, pokeballReward);
    channel.send(
      `${userTag}, Congratulations! You leveled up and you are now level: ${level}.\n You've been rewarded with **${pokeballReward} Pok??balls**!`
    );
  }
};

// User Icon
const updateUserIcon = (userId, icon) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    trainer: icon,
  });
};

// User Rank
const sortLevelsAndReturnRank = async (userId) => {
  const userRef = db.collection("users");
  const snapshot = await userRef.get();
  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  const sortedUsers = users.sort((user1, user2) => user2.xp - user1.xp);
  const rank = sortedUsers.findIndex((user) => user.id === userId) + 1;

  return rank;
};

// User Bag
const updatePokeballs = (userId, amount) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    pokeballs: firebase.firestore.FieldValue.increment(amount),
  });
};

const getPokeballs = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  return userDoc.data().pokeballs;
};

// User Buddy
const getBuddy = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  const buddyDocId = userDoc.data().buddy;
  if (!buddyDocId) return;
  const buddyDoc = await userRef.collection("pokemons").doc(buddyDocId).get();

  return { docId: buddyDocId, ...buddyDoc.data() };
};

const setBuddy = async (userId, pokemonDocId) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    buddy: pokemonDocId,
  });
};

// User Pokemon Team
const getTeam = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const teamIds = userDoc.data().team;

  if (!teamIds.length) {
    return [];
  }

  const pokemonsRef = userRef.collection("pokemons");
  const snapshot = await pokemonsRef
    .where(firebase.firestore.FieldPath.documentId(), "in", teamIds)
    .get();

  if (snapshot.empty) {
    return [];
  }

  const team = snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));

  return team;
};

const updateTeam = (userId, team) => {
  const userRef = db.collection("users").doc(userId);

  userRef.update({
    team,
  });
};

module.exports = {
  createUserProfile,
  getUserProfile,
  givePokemonToUser,
  getUserPokemons,
  updateUserPokedex,
  getUserPokedex,
  updateUserXP,
  updateUserIcon,
  sortLevelsAndReturnRank,
  updatePokeballs,
  getPokeballs,
  getBuddy,
  setBuddy,
  updateUserPokemonCount,
  getUserPokemonCount,
  getTeam,
  updateTeam,
};
