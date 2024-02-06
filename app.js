require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js')
const mongoose = require("mongoose");
const modlogSchema = require('./src/schema/modlogSchema.js');
const chatlogSchema = require('./src/schema/chatlogSchema.js');
 
const client = new Client({ intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]})

client.modlogs = async (guild, target, user, infraction, reason, color) => {
	const data = await modlogSchema.findOne({ GuildID: guild.id });
	if(!data) return;

	if(!data.Status) return;

	const channel = guild.channels.cache.get(data.ChannelID);
	const logsEmbed = new EmbedBuilder()
		.setColor(color)
		.setDescription(`**${infraction.Type.toUpperCase()}** | \`[case-${infraction.ID}]\``)
		.addFields(
			{ name: `Target`, value: `<@!${target.id}>`, inline: true },
			{ name: `Moderator`, value: `<@!${user.id}>`, inline: true },
			{ name: `Reason`, value: reason })
		.setTimestamp()
		.setFooter({ text: `ID: ${target.id}`});

	channel.send({ embeds: [logsEmbed] });
}

client.chatlogs = async (guild, author, message, color) => {
	const data = await chatlogSchema.findOne({ GuildID: guild.id });
	if(!data) return;

	if(!data.Status) return;

	const channel = guild.channels.cache.get(data.ChannelID);
	const logsEmbed = new EmbedBuilder()
		.setColor(color)
		.setAuthor({
            name: `${author.tag} | ${author.id}`,
            iconURL: author.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
		})
		.setDescription(`**Content**\n${message.content}`)
		.setTimestamp()
		.setFooter({ text: `ID: ${message.id}`});
	
	channel.send({ embeds: [logsEmbed] });
}

const commands = [];
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);
client.commands = new Collection();

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

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
        await command.execute(client, interaction);
	}
	catch (error) {
		console.error(error);
	}
});

mongoose.connect(process.env.DB_STRING);

client.once(Events.ClientReady, () => {
    console.log('Ready')
})

client.on(Events.MessageCreate, (message) => {
	const { author, mentions, guild, guildId } = message;
})


client.on(Events.MessageDelete, (message) => {
	const { author, mentions, guild, guildId } = message;
	client.chatlogs(guild, author, message, 'Red' );
})

client.login(process.env.DISCORD_TOKEN);