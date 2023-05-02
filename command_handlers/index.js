const { handleSend, generateImage } = require('../api')
const { EmbedBuilder } = require('discord.js')
const { getPersonalityIdxLbl } = require('../db/controllers/personalityController')
const { updatePersonalityId } = require('../db/models/userSetting')
let selectedPersonalityIdx = 11

async function fetchPersonalityTitles() {
	console.log('fetchPersonalityTitles: start')
	return new Promise((resolve, reject) => {
		getPersonalityIdxLbl((err, rows) => {
			if (err) {
				console.error('fetchPersonalityTitles: error', err)
				reject(err)
			} else {
				console.log('fetchPersonalityTitles: success')
				resolve(rows.map(row => ({ label: row.label, value: row.id.toString() })))
			}
		})
	})
}

async function handleAskCommand(interaction) {
	await interaction.deferReply()
	const userName = interaction.member.displayName
	const userInput = interaction.options.getString('question')
	const chatbotResponse = await handleSend(userInput, selectedPersonalityIdx)
	await interaction.editReply(`**${userName} asks:** ${userInput}\n\n**Joulebot:** ${chatbotResponse}`)
}

async function handleDrawCommand(interaction) {
	await interaction.deferReply()
	const userName = interaction.member.displayName
	const imageDescription = interaction.options.getString('description')
	const imageUrl = await generateImage(imageDescription)
	if (imageUrl) {
		const imageEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`**${userName} requested:** ${imageDescription}`)
			.setImage(imageUrl)
		await interaction.editReply({ embeds: [imageEmbed] })
	} else {
		await interaction.editReply("I'm sorry, but I'm having trouble generating an image right now. Please try again later.")
	}
}

async function handlePersonalityCommand(interaction) {
	console.log('handlePersonalityCommand: start')
	await interaction.deferReply() 
	
	const discordId = interaction.member.user.id
	selectedPersonalityIdx = parseInt(interaction.options.getString("choice"))
	console.log(`Selected personality index: ${selectedPersonalityIdx}`)

	const personalityTitles = await fetchPersonalityTitles()
	console.log('handlePersonalityCommand: fetched personality titles')
	const selectedPersonality = personalityTitles.find(
		(p) => p.value === interaction.options.getString("choice")
	)
	console.log(`Selected personality: ${JSON.stringify(selectedPersonality)}`)

	try {
		console.log('handlePersonalityCommand: updating personality')
		await updatePersonalityId(discordId, selectedPersonalityIdx)
		console.log('handlePersonalityCommand: updated personality')
		await interaction.editReply(`Personality set to: ${selectedPersonality.label}`)
	} catch (err) {
		console.error(`Error updating personality_id: ${err.message}`)
		await interaction.editReply("There was an error updating your personality. Please try again later.")
	}
}

async function handleDirectMessage(message) { 
	const userName = message.author.username
	const userInput = message.content
	// Start a loop to repeatedly send the typing indicator.
	const typingInterval = setInterval(() => {
		message.channel.sendTyping()
	}, 2000) // Repeat every 2 seconds.
	const chatbotResponse = await handleSend(userName + ' asks: ' + userInput, selectedPersonalityIdx)
	clearInterval(typingInterval)
	await message.reply(chatbotResponse)
}

async function handleReply(message) { 
	const userName = message.author.username
	const userInput = message.content
	// Start a loop to repeatedly send the typing indicator.
	const typingInterval = setInterval(() => {
		message.channel.sendTyping()
	}, 2000) // Repeat every 2 seconds.
	const chatbotResponse = await handleSend(userName + ' responds: ' + userInput, selectedPersonalityIdx)
	clearInterval(typingInterval)
	await message.reply(chatbotResponse)
}

module.exports = {
	handleAskCommand,
	handleDrawCommand,
	handlePersonalityCommand,
	handleDirectMessage,
	handleReply,
	selectedPersonalityIdx
}
