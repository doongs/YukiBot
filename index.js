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
  //client.channels.cache.get('755833627761180742').send(`No don't do that`);
});
//Handle the manual prefix.checkChapter command 
client.on('message', msg => {
  if (msg.content === `${process.env.PREFIX}.check`) {
    client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Manual chapter update requested`);
    checkChapter();
  }
  if (msg.content.includes(`${process.env.PREFIX}.extra`)) {
    client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Manual chapter update requested`);
    var num = msg.content.replace(/[^0-9]/g, '');
    extraChapter(num);
  }
  if (msg.content.toLowerCase().includes('next') || msg.content.toLowerCase().includes('out') || msg.content.toLowerCase().includes('new')) {
    if (msg.content.toLowerCase().includes('when') || msg.content.toLowerCase().includes('whens')) {
      if (msg.content.toLowerCase().includes('chapter')) {
        msg.channel.send("Don't ask that, it'll come when it comes.");
      }
    }
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
    //console.log(chapter);

    db.get("lastChapter").then(value => {
      if (value != chapter.chapter && (chapter.language == 'GB' || chapter.language == 'en_EN' || chapter.language == 'en_US')) {
        db.set("lastChapter", chapter.chapter).then(() => { console.log(`${new Date().toLocaleString()}: New chapter is Ch. ${chapter.chapter}`) });
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: New chapter is Ch. ${chapter.chapter}`);
        sendMessage(chapter);
        return true;
      } else {
        console.log(`${new Date().toLocaleString()}: Current chapter is still Ch. ${chapter.chapter}`);
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Current chapter is still Ch. ${chapter.chapter}`);
        return false;
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

//If an extra chapter is released and it's not the latest chapter number wise, manually update for it
function extraChapter(chapterId) {
  client.login()
  Mangadex.agent.login(process.env.MANGADEX_USERNAME, process.env.MANGADEX_PASSWORD, false).then(async () => {
    let chapter = await Mangadex.Chapter.get(chapterId);
    //Console log for 
    console.log(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
    //Sends a message to the admin bot logging channel
    client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
    client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`<@&${process.env.DISCORD_ROLE}>\nHey everyone, extra chapter ${chapter.chapter} is out now from ${chapter.groups[0].title}!\n${chapter.url}`);
  });
}



