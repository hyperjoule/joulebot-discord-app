// index.js
const dotenv = require('dotenv')
dotenv.config()

const initDb = require('./db/init_db')
const { addAllGuildMembersToDatabase } = require('./utils/db_functions')
const { addUser } = require('./db/controllers/userController.js')
const { prepopulateUserSettings } = require('./db/controllers/userSettingController.js')
const { setPersonalityChoices, scheduleRandomDm, sendGreeting } = require('./helpers')

const { Client, GatewayIntentBits, Partials, DMChannel } = require('discord.js')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions 
	],
	partials: [
		Partials.Channel,
		Partials.Message,
		Partials.GuildMember,
		Partials.User
	]
})

const { handleAskCommand, 
	handleDrawCommand, 
	handlePersonalityCommand, 
	handleReply } = require('./command_handlers')

const startBot = async () => {
	await initDb()
	// Client handlers
	client.on('ready', async () => {
		console.log(`Ready! Logged in as ${client.user.tag}`)
		const guild = client.guilds.cache.get(process.env.GUILD_ID)
		if (guild) {
			await addAllGuildMembersToDatabase(guild)
			await prepopulateUserSettings()
		} else {
			console.error('Guild not found. Please check your GUILD_ID.')
		}
		scheduleRandomDm(client)
		// Register slash commands
		const commands = await client.guilds.cache.get(process.env.GUILD_ID)?.commands.set([
			{
				name: 'ask',
				description: 'Ask Joulebot a question!',
				options: [
					{
						name: 'question',
						type: 3, // STRING
						description: 'Your question',
						required: true
					}
				]
			},
			{
				name: 'draw',
				description: 'Have Joulebot request an image from Dall-E!',
				options: [
					{
						name: 'description',
						type: 3, // STRING
						description: 'Description of the image',
						required: true
					}
				]
			},
			{
				name: 'personality',
				description: 'Select a personality for Joulebot',
				options: [
					{
						name: 'choice',
						type: 3, // STRING
						description: 'Choose a personality',
						required: true,
						choices: await setPersonalityChoices()
					}
				]
			}
		])
	})

	client.on('messageCreate', async (message) => {
		// Ignore messages from bots
		if (message.author.bot) return
	
		// If message is empty, null, or undefined, ignore
		if (!message || message === null || message === 'undefined') {
			return
		}
	
		// Check if the message is a direct message
		if ( message.guild===null ) {
			await handleReply(message, ' asks: ')
		} else if (message.reference?.messageId) {
			// Fetch the replied-to message
			const repliedToMessage = await message.channel.messages.fetch(message.reference.messageId)
			// Check if the replied-to message was sent by the bot
			if (repliedToMessage.author.id === client.user.id) {
				await handleReply(message)
			}
		} else {
			const botUsernamePrefix = client.user.username.substring(0, 8).toLowerCase()
			const messageContentLower = message.content.toLowerCase()
			if (messageContentLower.includes(botUsernamePrefix)) {
				await handleReply(message, ' asks: ')
			} else if (message.mentions.users.has(client.user.id)) {
				await handleReply(message, ' asks: ')
			}
		}
	})

	client.on('interactionCreate', async interaction => {
		console.log('Interaction received:', interaction.commandName)
		if (!interaction.isCommand() && interaction.type !== 'MESSAGE_COMPONENT') return

		switch (interaction.commandName) {
		case 'ask':
			await handleAskCommand(interaction)
			break   
		case 'draw':
			await handleDrawCommand(interaction)
			break
		case 'personality':
			await handlePersonalityCommand(interaction)
			break
		}

	})
					
	client.login(process.env.BOT_TOKEN)
}
startBot()