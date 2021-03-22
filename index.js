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
  // Check if the message start with the prefix, or if the message came from a bot. If so, return.
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

  // Disect the message, get the args and command name.
  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);

  const commandName = args.shift().toLowerCase();
  // Check if the command exists.
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  // Check if there is any args.
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${msg.author}`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
    }

    return msg.channel.send(reply);
  }

  // Execute the command.
  try {
    if (command.name === "help") {
      command.execute(client.commands);
    } else {
      command.execute(msg, args);
    }
  } catch (err) {
    console.error(err);
    msg.reply("Error: " + err);
  }
});

client.login(`${process.env.TOKEN}`);
