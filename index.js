const Discord = require('discord.js');
const Mangadex = require('mangadex-full-api');

Mangadex.agent.login("mfa", "mangadex-full-api", false).then(async () => {

  var manga = new Mangadex.Manga();
  await manga.fill(6770);
  //console.log(`${manga.title} by ${manga.authors.join(", ")}`);
  
  let chapterId = manga.chapters[0].id;

  // New v4.0.0 Method
  let chapter = await Mangadex.Chapter.get(chapterId);
  console.log(`@manga updates\nHey everyone, chapter ${chapter.chapter} is out now from ${chapter.groups[0].title}!\n${chapter.url}`);
});

// Importing this allows you to access the environment variables of the running node process
/*
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
*/