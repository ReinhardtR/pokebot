// Enviroment Variables
require("dotenv").config();

// File System
const fs = require("fs");

// Constants
const PREFIX = "p!";
const menuGUI = "https://i.imgur.com/Sx2mQTH.png";

// Discord.js
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Find all command files
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

// Load command files and set in collection
commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "yo") {
    client.commands.get("sendYo").execute(msg, args);
  } else if (command === "pokedex") {
    client.commands.get("sendPokedex").execute(msg, args);
  } else if (command === "menu") {
    client.commands.get("sendMenuGUI").execute(msg, args);
  }
});

client.login(`${process.env.TOKEN}`);
