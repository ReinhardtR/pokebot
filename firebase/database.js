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
  const userDoc = db.collection("users").doc(userId);

  userDoc.set({
    level: 1,
    xp: 0,
  });
}

function givePokemonToUser(userId, pokemonId) {
  const userDoc = db.collection("users").doc(userId);

  const pokemon = {
    name: "Charizard",
    id: pokemonId,
    level: 1,
    xp: 0,
  };

  userDoc.collection("pokemons").add(pokemon);
}

module.exports = {
  createUserProfile,
  givePokemonToUser,
};
