module.exports = {
  name: "help",
  description: "List of all commands or info about a specefic command.",
  aliases: ["commands"],
  usage: "[command name]",
  execute(msg, args) {
    sendHelpMenu(msg, args);
  },
};

async function sendHelpMenu(msg, args) {
  const Discord = require("discord.js");
  const { PREFIX } = require("../../constants/config.json");
  const { commands } = msg.client;

  const embed = new Discord.MessageEmbed().setColor(53380);

  if (!args) {
    embed
      .setTitle("Help Menu")
      .setDescription(
        msg.author.toString() + " here is all the help you need!"
      );

    commands.forEach((command) => {
      embed.addField(command.name, command.description);
    });
  } else {
    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    if (!command) {
      return msg.reply("That's not a valid command.");
    }

    const usageField = {
      name: "Usage",
      value: `${PREFIX}${command.name} ${command.usage || ""}`,
    };

    const aliases = command.aliases
      ? command.aliases.join(", ")
      : "No aliases.";
    const aliasesField = {
      name: "Aliases",
      value: aliases,
    };

    embed
      .setTitle(command.name)
      .setDescription(command.description)
      .addFields(usageField, aliasesField);
  }
  msg.channel.send({ embed });
}
