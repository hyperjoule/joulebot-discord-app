const { handleSend, generateImage } = require('../api')
const { EmbedBuilder } = require('discord.js')
const { getPersonalityIdxLbl, updatePersonalityId } = require('../db/userQueries')
let selectedPersonalityIdx = 6

async function fetchPersonalityTitles() {
	return new Promise((resolve, reject) => {
		getPersonalityIdxLbl((err, rows) => {
			if (err) {
				reject(err)
			} else {
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
			.setImage(imageUrl);
		await interaction.editReply({ embeds: [imageEmbed] })
	} else {
		await interaction.editReply("I'm sorry, but I'm having trouble generating an image right now. Please try again later.")
	}
}

async function handlePersonalityCommand(interaction) {
	const discordId = interaction.member.user.id
	const selectedPersonalityIdx = parseInt(interaction.options.getString('choice'))
	const personalityTitles = await fetchPersonalityTitles()
	const selectedPersonality = personalityTitles.find(
		(p) => p.value === interaction.options.getString('choice')
	)

	updatePersonalityId(discordId, selectedPersonalityIdx, (err) => {
		if (err) {
			console.error(`Error updating personality_id: ${err.message}`)
			interaction.reply("There was an error updating your personality. Please try again later.")
		} else {
			interaction.reply(`Personality set to: ${selectedPersonality.label}`)
		}
	})
}

async function handleDirectMessage(message) { 
	const userName = message.author.username
	const userInput = message.content
	const chatbotResponse = await handleSend(userName + ' asks: ' + userInput, selectedPersonalityIdx)
	await message.reply(chatbotResponse)
}

async function handleReply(message) { 
	const userName = message.author.username
	const userInput = message.content
	const chatbotResponse = await handleSend(userName + ' responds: ' + userInput, selectedPersonalityIdx)
	await message.reply(chatbotResponse)
}

module.exports = {
	handleAskCommand,
	handleDrawCommand,
	handlePersonalityCommand,
	handleDirectMessage,
	handleReply,
	selectedPersonalityIdx
};
