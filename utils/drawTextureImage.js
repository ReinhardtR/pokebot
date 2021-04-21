// const Canvas = require("canvas");
// const pokemons = require("../constants/pokemons.json");
// const fs = require("fs");

// const drawPokemons = async () => {
//   const images = await Promise.all(
//     pokemons.map(async (pokemon) => ({
//       front: await Canvas.loadImage(pokemon.sprites.front),
//       back: await Canvas.loadImage(pokemon.sprites.back),
//     }))
//   );

//   const imageSize = 96;

//   const canvas = Canvas.createCanvas(images.length * imageSize, imageSize * 2);

//   const ctx = canvas.getContext("2d");

//   images.forEach((image, index) => {
//     const imagePosX = index * imageSize;

//     ctx.drawImage(image.front, imagePosX, 0);
//     ctx.drawImage(image.back, imagePosX, imageSize);
//   });

//   const buffer = canvas.toBuffer("image/png");

//   fs.writeFileSync("pokemon.png", buffer);
// };

// drawPokemons();
