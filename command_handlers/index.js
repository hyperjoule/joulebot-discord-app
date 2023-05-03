const { handleSend, generateImage } = require('../api')
const { EmbedBuilder } = require('discord.js')
const { getPersonalityIdxLbl } = require('../db/controllers/personalityController')
const { updatePersonalityId, getPersonalityIdByDiscordId } = require('../db/controllers/userSettingController')
let selectedPersonalityIdx = 0

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
	selectedPersonalityIdx = await getPersonalityIdByDiscordId(interaction.user.id)
	const userName = interaction.member.displayName
	const userInput = interaction.options.getString('question')
	const chatbotResponse = await handleSend(userInput, selectedPersonalityIdx, interaction.user.id)
	await interaction.editReply(`**${userName} asks:** ${userInput}\n\n**Joulebot:** ${chatbotResponse}`)
}

async function handleDrawCommand(interaction) {
	await interaction.deferReply()
	const imageDescription = interaction.options.getString('description')
	// Check if the input length exceeds 256 characters
	if (imageDescription.length > 256) {
		await interaction.editReply('Please limit your request to under 256 characters.')
		return 
	}
	const userName = interaction.member.displayName
	
	const imageUrl = await generateImage(imageDescription, interaction.user.id)
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
	await interaction.deferReply() 
	const discordId = interaction.member.user.id
	selectedPersonalityIdx = parseInt(interaction.options.getString("choice"))
	const personalityTitles = await fetchPersonalityTitles()
	const selectedPersonality = personalityTitles.find(
		(p) => p.value === interaction.options.getString("choice")
	)
	try {
		await updatePersonalityId(discordId, selectedPersonalityIdx)
		await interaction.editReply(`Personality set to: ${selectedPersonality.label}`)
	} catch (err) {
		console.error(`Error updating personality_id: ${err.message}`)
		await interaction.editReply("There was an error updating your personality. Please try again later.")
	}
}

async function handleReply(message, txtString = ' says: ') { 
	const userName = message.author.username
	const userInput = message.content
	selectedPersonalityIdx = await getPersonalityIdByDiscordId(message.author.id)
	// Start a loop to repeatedly send the typing indicator.
	const typingInterval = setInterval(() => {
		message.channel.sendTyping()
	}, 5000) // Repeat every 5 seconds.
	const chatbotResponse = await handleSend(userName + txtString + userInput, selectedPersonalityIdx, message.author.id)
	clearInterval(typingInterval)
	await message.reply(chatbotResponse)
}

module.exports = {
	handleAskCommand,
	handleDrawCommand,
	handlePersonalityCommand,
	handleReply
}
