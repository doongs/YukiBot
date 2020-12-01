const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const Mangadex = require('mangadex-full-api');
const Database = require("@replit/database");
const db = new Database();

//http server to keep the replit running
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(3000);

//Create the instance of the bot
const client = new Discord.Client();
//Log message on successful Discord login
client.on('ready', () => {
  console.log(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
  client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
});
//Handle the manual prefix.checkChapter command 
client.on('message', msg => {
  if (msg.content === `${process.env.PREFIX}.check`) {
    client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Manual chapter update requested`);
    checkChapter();
  }
});

//uncomment this to reset the lastChapter key in the database to 0
//db.set("lastChapter", 0).then(() => { console.log(`lastChapter set to 0`) });

//Logs the bot into Mangadex and Discord, and determines if a new chapter has been uploaded
function checkChapter() {
  //Discord login
  client.login();
  //Mangadex Login
  Mangadex.agent.login(process.env.MANGADEX_USERNAME, process.env.MANGADEX_PASSWORD, false).then(async () => {
    var manga = new Mangadex.Manga();
    await manga.fill(process.env.MANGADEX_ID);
    let chapterId = manga.chapters[0].id;
    let chapter = await Mangadex.Chapter.get(chapterId);
    db.get("lastChapter").then(value => {
      if (value < chapter.chapter) {
        db.set("lastChapter", chapter.chapter).then(() => { console.log(`${new Date().toLocaleString()}: New chapter is Ch. ${chapter.chapter}`) });
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: New chapter is Ch. ${chapter.chapter}`);
        sendMessage(chapter);
      } else {
        console.log(`${new Date().toLocaleString()}: Current chapter is still Ch. ${chapter.chapter}`);
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Current chapter is still Ch. ${chapter.chapter}`);
      }
    });
  });
}

//Check for a new chapter once on init and again every UPDATE_INTERVAL milleseconds
checkChapter();
setInterval(checkChapter, process.env.UPDATE_INTERVAL);

//Function to handle message sending on a manga update
function sendMessage(chapter) {
  //Console log for 
  console.log(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
  //Sends a message to the admin bot logging channel
  client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
  //Sends a message to the update channel with the chapter number, translation group, and Mangadex URL
  client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`<@&${process.env.DISCORD_ROLE}>\nHey everyone, chapter ${chapter.chapter} is out now from ${chapter.groups[0].title}!\n${chapter.url}`);
}
