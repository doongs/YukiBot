const Discord = require('discord.js');
// Importing this allows you to access the environment variables of the running node process
require('dotenv').config();

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

// Here you can login the bot. It automatically attempts to login the bot
// with the environment variable you set for your bot token ("DISCORD_TOKEN")
client.login();