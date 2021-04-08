// Enviroment Variables
require("dotenv").config();

// File System
const fs = require("fs");

// Discord.js
const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.walks = new Discord.Collection();

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

// Constants
const { PREFIX } = require("./constants/config.json");

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", async (msg) => {
  // Check if the message start with the prefix, or if the message came from a bot. If so, return.
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return;

  // Disect the message, get the args and command name.
  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if the command exists.
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  // Return if command doesn't exist.
  if (!command) return;

  // Check if the command is server-only, and the message is a DM.
  if (command.guildOnly && msg.channel.type === "dm") {
    return msg.reply("I can't execute that command inside DMs!");
  }

  // Check if the command requires permission, and if user has permission.
  if (command.permissions) {
    const authorPerms = msg.channel.permissionsFor(msg.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return msg.reply("you don't have permission to use this command.");
    }
    x;
  }

  // Check if you need a profile to run this command.
  if (command.needProfile) {
    const { getUserProfile } = require("./database");
    const hasProfile = await getUserProfile(msg.author.id);
    if (!hasProfile) {
      return msg.reply(
        "you need a profile to use this command. Type **p!create** to create one."
      );
    }
  }

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
    command.execute(msg, args);
  } catch (err) {
    console.error(err);
    msg.reply("Error: " + err);
  }
});

client.login(`${process.env.TOKEN}`);
