# Yuki Yoshikawa

![Yuki Yoshikawa](https://i.imgur.com/hoqG1zW.jpg)      
     
Discord bot for notifying users of Mangadex chapter updates
Running on Repl.it

## Setup Guide

 - Follow the instructions found [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) and [here](https://discordjs.guide/preparations/adding-your-bot-to-servers.html) to get your bot set up in the Discord Developer Portal where it can have its own unique name and profile icon
 - Download a copy of the files in this repository for use in step 3 (***Don't directly use this repository***)
 - Follow [this](https://anidiots.guide/hosting/repl) detailed guide to setup continuous hosting for your bot on Repl.it 
 - Edit the name and description in the package.json file 
 - If needed, create a Mangadex account for the bot
 - The .env file should be configured as follows (***Do not expose this data or you may violate the Discord Terms of Service)***  
	DISCORD_TOKEN=the bot secret token (string)  
	DISCORD_CHANNEL=the update channel id (int)  
	DISCORD_LOG=the admin logging channel (int)  
	DISCORD_ROLE=the role id to mention for chapter updates (int)  
	MANGADEX_USERNAME=the Mangadex username used to authorize the bot's access to the API (string)  
	MANGADEX_PASSWORD=the Mangadex password used to authorize the bot's access to the API (string)  
	MANGADEX_ID=the Mangadex id for the manga to check (int)  
	PREFIX=the bot command prefix  
	UPDATE_INTERVAL=the time in ms (30 minutes = 8000000)  to wait before checking updates (int)  
 - Run the Repl.it repository and the bot should send log messages similar to these
![Console Log Example](https://i.imgur.com/85MQtLi.png)	 ![Discord Log Example](https://i.imgur.com/BVlng3W.png)
## Commands
To use the following commands, type [PREFIX].[COMMAND] into any Discord channel
 - check (manually check for a new chapter update)
---
If you find this bot helpful, you can [buy me a coffee](https://www.buymeacoffee.com/doongs)!
