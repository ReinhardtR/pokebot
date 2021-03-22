// Enviroment Variables
require("dotenv").config();

// Constants
const PREFIX = "p!";

// Discord.js
const client = require("./client");

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    if (command.name === "help") {
      command.execute(msg, client.commands);
    } else {
      command.execute(msg, args);
    }
  } catch (err) {
    console.error(err);
    msg.reply("Error: " + err);
=======
    console.log("TRYING")
=======
    console.log("TRYING");
>>>>>>> Stashed changes
    command.execute(msg, args);
  } catch (error) {
    console.log("ERROR HERE");
    msg.reply("Error: " + error);
  }
});

client.login(`${process.env.TOKEN}`);
