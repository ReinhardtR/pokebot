// Enviroment Variables
require("dotenv").config();

// File System
const fs = require("fs");

// Constants
const PREFIX = "p!";

// Discord.js
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Find all command files
const commandFolders = fs.readdirSync("./commands");

// Load command files and set in collection
commandFolders.forEach((folder) => {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  commandFiles.forEach((file) => {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  });
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", (msg) => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  try {
    command.execute(msg, args);
  } catch (err) {
    console.error(err);
    msg.reply("Error: " + err);
  }
});

client.login(`${process.env.TOKEN}`);
