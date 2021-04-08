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
  });
  userRef.collection("pokemons").add({});
};

const getUserProfile = async (userId) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const pokemonsRef = await userRef.collection("pokemons").get();
  const pokemons = pokemonsRef.docs.map((doc) => doc.data());
  return { ...userDoc.data(), pokemons };
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

module.exports = {
  createUserProfile,
  getUserProfile,
  givePokemonToUser,
  getUserPokemons,
  updateUserPokedex,
  getUserPokedex,
  isUserWalking,
  setIsUserWalking,
};
