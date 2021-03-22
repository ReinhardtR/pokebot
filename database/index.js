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

function createUserProfile(userId) {
  const userRef = db.collection("users").doc(userId);
  userRef.set({
    level: 1,
    xp: 0,
    pokedex: [],
  });
  userRef.collection("pokemons").add({});
}

function givePokemonToUser(userId, pokemon) {
  const userRef = db.collection("users").doc(userId);
  userRef.collection("pokemons").add(pokemon);
}

async function getUserPokemons(userId) {
  const userRef = db.collection("users").doc(userId);
  const snapshot = await userRef.collection("pokemons").get();
  const pokemons = snapshot.docs.map((doc) => doc.data());
  return pokemons;
}

async function getUserPokedex(userId) {
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();
  const pokedex = doc.data().pokedex;
  return pokedex;
}

module.exports = {
  createUserProfile,
  givePokemonToUser,
  getUserPokemons,
  getUserPokedex,
};
