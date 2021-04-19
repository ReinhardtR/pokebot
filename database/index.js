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

const createUserProfile = (userId) => {
  const userRef = db.collection("users").doc(userId);
  if (userRef.exists) return;
  userRef.set({
    level: 1,
    xp: 0,
    pokedex: [],
    trainer:
      "https://raw.githubusercontent.com/ReinhardtR/pokebot/main/images/pixelTrainersRescaled/pixelTrainer1.png",
    buddy: undefined,
  });
  userRef.collection("pokemons").add({});
};

const getUserProfile = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  return userDoc.data();
};

const givePokemonToUser = (userId, pokemon) => {
  const userRef = db.collection("users").doc(userId);
  userRef.collection("pokemons").add(pokemon);
};

const getUserPokemons = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const snapshot = await userRef.collection("pokemons").get();
  if (snapshot.exists) {
    const pokemons = snapshot.docs.map((doc) => doc.data());
    return pokemons;
  }
  return [];
};

const updateUserPokedex = (userId, pokedexArray) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    pokedex: pokedexArray,
  });
};

const getUserPokedex = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  if (doc.exists) {
    const pokedex = doc.data().pokedex;
    return pokedex;
  }
};

const isUserWalking = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  if (doc.exists) {
    const isWalking = doc.data().isWalking;
    return isWalking;
  }
  return false;
};

const setIsUserWalking = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  userRef.set({
    isWalking: true,
  });
};

const updateUserXP = async (userId, xpGain, msg) => {
  const userDoc = await getUserProfile(userId);
  const userXP = userDoc.xp;
  //Record old level
  const { getLevel } = require("../commands/profile/levelAndXP");
  const oldLevel = getLevel(userXP);
  //get ref and update xp
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    xp: userXP + xpGain,
  });
  //Define new level (has to be userDoc.xp to get new xp)
  const level = getLevel(userDoc.xp);
  console.log(level, oldLevel);
  if (oldLevel != level) {
    console.log("level up");
    msg.channel.send(
      `Congratulations! You leveled up and you are now level: ${level}`
    );
  }
};

const updateUserIcon = async (userId, icon) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({
    trainer: icon,
  });
};

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

const getBagContents = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  const bagContents = doc.data().items;
  return bagContents;
};

const updateBagContents = async (userId, ballAmount) => {
  const userRef = db.collection("users").doc(userId);
  const admin = require("firebase-admin");
  await userRef.update({
    balls: admin.firestore.FieldValue.increment(ballAmount),
  });
  return balls;
};

const getBuddyId = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const buddyId = userDoc.buddyId;
  if (buddyId == 0) {
    return msg.channel.send(`You do not have a buddy yet!`);
  }
  return userDoc.pokemons.doc(buddyId).id;
};

module.exports = {
  createUserProfile,
  getUserProfile,
  givePokemonToUser,
  getUserPokemons,
  updateUserPokedex,
  getUserPokedex,
  isUserWalking,
  setIsUserWalking,
  updateUserXP,
  updateUserIcon,
  sortLevelsAndReturnRank,
  getBagContents,
  updateBagContents,
  getBuddyId,
};
