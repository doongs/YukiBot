const Discord = require('discord.js');
const Mangadex = require('mangadex-full-api');
require('dotenv').config();
const Database = require("@replit/database");
const db = new Database();

//uncomment this to reset the lastChapter key in the database to 0
//db.set("lastChapter", 0).then(() => { console.log(`lastChapter set to 0`) });

require('dotenv').config();

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(3000);

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`${new Date().toLocaleString()} - Logged in as ${client.user.tag}!`);
});

client.login();

//this runs once on node index.js
Mangadex.agent.login("mfa", "mangadex-full-api", false).then(async () => {
    var manga = new Mangadex.Manga();
    await manga.fill(6770);

    let chapterId = manga.chapters[0].id;

    let chapter = await Mangadex.Chapter.get(chapterId);

    db.get("lastChapter").then(value => {
      if (value < chapter.chapter) {
        db.set("lastChapter", chapter.chapter).then(() => { console.log(`${new Date().toLocaleString()} - New chapter detected ${chapter.chapter}`) });

        client.channels.cache.get('782293480038727730').send(`${new Date().toLocaleString()} - New chapter detected ${chapter.chapter}`);

        ping(chapter);
      } else {
    
        console.log(`${new Date().toLocaleString()} - No new chapter, current last chapter is ${value}`);

        client.channels.cache.get('782293480038727730').send(`${new Date().toLocaleString()} - No new chapter, current last chapter is ${value}`);
      }
    });

  });

setInterval(function() {
  client.login();
  Mangadex.agent.login("mfa", "mangadex-full-api", false).then(async () => {
    var manga = new Mangadex.Manga();
    await manga.fill(6770);

    let chapterId = manga.chapters[0].id;

    let chapter = await Mangadex.Chapter.get(chapterId);

    db.get("lastChapter").then(value => {
      if (value < chapter.chapter) {
        db.set("lastChapter", chapter.chapter).then(() => { console.log(`${new Date().toLocaleString()} - New chapter detected ${chapter.chapter}`) });

        client.channels.cache.get('782293480038727730').send(`${new Date().toLocaleString()} - New chapter detected ${chapter.chapter}`);

        ping(chapter);
      } else {
    
        console.log(`${new Date().toLocaleString()} - No new chapter, current last chapter is ${value}`);

        client.channels.cache.get('782293480038727730').send(`${new Date().toLocaleString()} - No new chapter, current last chapter is ${value}`);
      }
    });

  });
}, 3600000);

function ping(chapter) {
  console.log(`${new Date().toLocaleString()} - Pinging for chapter ${chapter.chapter}`);

  client.channels.cache.get('782293480038727730').send(`${new Date().toLocaleString()} - Pinging for chapter ${chapter.chapter}`);

  client.channels.cache.get('755842328588976168').send(`<@&541810268615737359>\nHey everyone, chapter ${chapter.chapter} is out now from ${chapter.groups[0].title}!\n${chapter.url}`);
}
