// index.js
const dotenv = require('dotenv').config()
const initDb = require('./db/init_db')
const { addAllGuildMembersToDatabase, addUserToDatabase } = require('./utils/db_functions')
const { checkUserInDatabase } = require('./db/controllers/userController.js')
const { prepopulateUserSettings, addUserSettings } = require('./db/controllers/userSettingController.js')
const { setPersonalityChoices, scheduleRandomDm } = require('./helpers')

const { Client, GatewayIntentBits, Partials, DMChannel } = require('discord.js')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
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
const { getRandomPersonalityIndex } = require('./db/controllers/personalityController')
const { handleGreeting } = require('./api')

const startBot = async () => {
	await initDb()
	// Client handlers
	client.on('ready', async () => {
		console.log(`Ready! Logged in as ${client.user.tag}`)

		const guilds = client.guilds.cache.values()
		const promises = []
    
		for (const guild of guilds) {
			if (guild.id === process.env.GUILD_ID) {
				promises.push((async () => {
					await addAllGuildMembersToDatabase(guild)
					await prepopulateUserSettings()

					await guild.commands.set([
						{
							name: 'joulebot',
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
				})())
			}
		}
		await Promise.all(promises)

		scheduleRandomDm(client)
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
	
	client.on('interactionCreate', async (interaction) => {
		if (interaction.isMessageComponent()) {
			const member = interaction.member

			const generalChannel = member.guild.channels.cache.find(channel => channel.name === 'general' && channel.type === 'GUILD_TEXT')

			if (generalChannel && interaction.channelId === generalChannel.id) {
				try {
					const userExists = await checkUserInDatabase(member.id)

					if (!userExists) {
						await addUserToDatabase(member)
						await addUserSettings(member.id)
						const personalityIdx = getRandomPersonalityIndex()
						await handleGreeting(member, personalityIdx, generalChannel)
					}
				} catch (error) {
					console.error('Error on interactionCreate:', error)
				}
			}
		}
	})

	client.on('interactionCreate', async interaction => {
		console.log('Interaction received:', interaction.commandName)
		if (!interaction.isMessageComponent() && !interaction.isCommand()) return

		switch (interaction.commandName) {
		case 'joulebot':
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

	client.on('guildMemberAdd', async (member) => {
		await addUserToDatabase(member)
		await addUserSettings(member.id)
	})

	client.login(process.env.BOT_TOKEN)
}
startBot()