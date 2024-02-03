require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits, REST, Routes } = require('discord.js')
const { chatlogEmbed } = require('./src/embeds/embeds.js')
const mongoose = require("mongoose");
 
const client = new Client({ intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]})

client.commands = new Collection();

const commands = [];
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		commands.push(command.data.toJSON());
	}
}
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            { body: commands }
        );
        console.log('Slash commands were registered');
    } catch (err) {
        console.log(err)
    }
})();

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
var channelid = null

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
        if(interaction.commandName == 'setchatlog') {
            channelid = await command.execute(interaction);
        } else {
            await command.execute(interaction);
        }
	}
	catch (error) {
		console.error(error);
	}
});

mongoose.connect(process.env.DB_STRING)

client.once(Events.ClientReady, () => {
    console.log('Ready')
})


client.on('messageDelete', (message) => {
	console.log(channelid);
    if(!message.author.bot && channelid) {
		const embed = chatlogEmbed(message)
        client.channels.cache.get(channelid).send({ embeds: [embed] })
    }
})

client.login(process.env.DISCORD_TOKEN);