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
    pokemonCount: 0,
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
  // userRef.update({ pokemonCount: FieldValue.increment(1) });
};

const incrementUserPokemonCount = (userId) => {
  const userRef = db.collection("users").doc(userId);
  userRef.update({ pokemonCount: firebase.firestore.FieldValue.increment(1) });
};

const getUserPokemonCount = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  return userDoc.data().pokemonCount;
};

const getUserPokemons = async (
  userId,
  limit = 20,
  value = "name",
  order = "desc"
) => {
  const pokemonsRef = db.collection("users").doc(userId).collection("pokemons");
  const snapshot = await pokemonsRef.orderBy(value, order).limit(limit).get();
  const pokemons = snapshot.docs.map((doc) => doc.data());
  return pokemons;
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
  // const userRef = db.collection("users").doc(userId);
  // const admin = require("firebase-admin");
  // await userRef.update({
  //   balls: admin.firestore.FieldValue.increment(ballAmount),
  // });
  // return balls;
};

const getBuddyId = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const buddyDocId = userDoc.buddyId;
  const buddyDoc = await userRef.collection("pokemons").doc(buddyDocId).get();

  return buddyDoc.data();
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
  getBagContents,
  updateBagContents,
  getBuddyId,
  incrementUserPokemonCount,
  getUserPokemonCount,
};
