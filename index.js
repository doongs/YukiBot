const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const Mangadex = require('mangadex-full-api');
const Database = require("@replit/database");
const fetch = require("node-fetch");
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
   if (msg.content.includes(`${process.env.PREFIX}.anime`)) {
    client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()} Manual Anime Update requested`);
    checkEpisode();
  }
  if (msg.content.toLowerCase().includes('next') || msg.content.toLowerCase().includes('out') || msg.content.toLowerCase().includes('new')) {
    if (msg.content.toLowerCase().includes('when') || msg.content.toLowerCase().includes('whens')) {
      if (msg.content.toLowerCase().includes('chapter')) {
        msg.channel.send("Don't ask that, it'll come when it comes.");
      }
    }
  }
});



//uncomment this to reset the lastChapter key in the database to 0, uncomment the following line to reset the lastEpisode key in the database to 0

//db.set("lastChapter", 0).then(() => { console.log(`lastChapter set to 0`) });
db.set("lastEpisode", 0).then(() => {console.log(`lastEpisode set to 0`)});
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
    console.log(chapter);

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
function checkEpisode(){
  client.login()
  //Query the Anilist API for episodes of the Horimiya anime
var query = `
query ($id: Int) {
  Media (id: $id, type: ANIME) { 
    id
    title {
      romaji
      english
      native
    }
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }
  }
}
`;
// Define our query variables and values that will be used in the query request
var variables = {
    id: 1
};

// Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

// Make the HTTP Api request
fetch(url, options).then(handleResponse).then(handleData).catch(handleError);


function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    console.log(data.data.Media.streamingEpisodes[(data.data.Media.streamingEpisodes.length -1)])

    var newestEpisode = (data.data.Media.streamingEpisodes[(data.data.Media.streamingEpisodes.length -1)])

    db.get("lastEpisode").then(value => {
      if (value != newestEpisode.title) {
        db.set("lastEpisode", newestEpisode.title).then(() => { console.log(`${new Date().toLocaleString()}: New episode is Ep. ${newestEpisode.title}`) });
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()} New episode is Ep. ${newestEpisode.title}`);
        sendAnimeMessage(newestEpisode);
        return true;
      } else {
        console.log(`${new Date().toLocaleString()} Current episode is still Ep. ${newestEpisode.title}`);
        client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()} Current episode is still Ep. ${newestEpisode.title}`);
        return false;
      }
    });

}

function handleError(error) {
    alert('Error, check console');
    console.error(error);
}

}

//Check for a new chapter once on init and again every UPDATE_INTERVAL milleseconds
checkChapter();
checkEpisode();
setInterval(() => {
  checkChapter(); 
  checkEpisode();
}, 
process.env.UPDATE_INTERVAL);

//Function to handle message sending on a manga update
function sendMessage(chapter) {
  //Console log for 
  console.log(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
  //Sends a message to the admin bot logging channel
  client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Sending message for Ch. ${chapter.chapter}`);
  //Sends a message to the update channel with the chapter number, translation group, and Mangadex URL
  client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`<@&${process.env.DISCORD_ROLE}>\nHey everyone, chapter ${chapter.chapter} is out now from ${chapter.groups[0].title}!\n${chapter.url}`);
}

function sendAnimeMessage(newestEpisode){
  //This is effectively a copy of sendMessage, just written in terms of the checkEpisode function
  console.log(`${new Date().toLocaleString()}: Sending message for Ep. ${newestEpisode.title}`);
  client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()} Sending message for episode ${newestEpisode.title}`);
  client.channels.cache.get(process.env.DISCORD_CHANNEL).send(`<@&${process.env.DISCORD_ROLE}> A new episode has been released! It is ${newestEpisode.title}, Here is the link! ${newestEpisode.url}`);

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
