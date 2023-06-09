// helpers
const dotenv = require('dotenv').config()
const { handleSend } = require('../api')
const { getPersonalityIdxLbl, getRandomPersonalityIndex } = require('../db/controllers/personalityController')
const randomPrompts = require('./random_prompts.json')
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 

const getRandomPrompt = () => {
	const randomIndex = Math.floor(Math.random() * randomPrompts.length)
	return randomPrompts[randomIndex]
}

let selectedPersonalityIdx = 0 // for random messages

async function setPersonalityChoices() {
	const personalities = await new Promise((resolve, reject) => {
		getPersonalityIdxLbl((err, rows) => {
			if (err) {
				reject(err)
			} else {
				resolve(rows)
			}
		})
	})

	return personalities.map(personality => ({
		name: personality.label,
		value: personality.id.toString()
	}))
}

async function sendRandomDm(guild) {
	let retries = 0
	while (retries < MAX_RETRIES) {
		try {
			const fetchedMembers = await guild.members.fetch({ limit: 100, withPresences: true, time: 60000 })
			const guildMembers = fetchedMembers.filter(member => !member.user.bot)
			let randomMember = guildMembers.random()
			let question = `${randomMember.displayName}: ${getRandomPrompt()}`
			selectedPersonalityIdx = await getRandomPersonalityIndex()
			const chatbotResponse = await handleSend(question, selectedPersonalityIdx, randomMember.user.id)
			console.log(chatbotResponse)  // log the chatbotResponse object
			// Check if the chatbotResponse is valid
			if (!chatbotResponse || chatbotResponse.length === 0) {
				throw new Error('Failed to generate a valid chatbot response.')
			}

			// Concatenate all elements in the chatbotResponse array into a single string
			let concatenatedResponse = chatbotResponse.join('\n').trim()

			// Check if the concatenated string is empty
			if (concatenatedResponse === '') {
				throw new Error('Failed to generate a valid chatbot response.')
			}

			// Try to send the message
			await randomMember.send(concatenatedResponse)

			console.log(`Sent random message to ${randomMember.displayName}`)
			break // Exit the loop if successful

		} catch (error) {
			if (error.code === 50007) { // Error: Cannot send messages to this user
				console.log("Cannot send messages to this user, trying another one...")
				// No increment for retries in this case as we are just skipping the user who blocked DMs
				continue // Skip the rest of the loop and start from the beginning
			}

			// Original error handling
			if (error.code === 'GuildMembersTimeout') {
				console.log("Members didn't arrive in time. Increase the timeout duration if needed.")
			} else {
				console.log(error)
			}
			retries += 1
			if (retries < MAX_RETRIES) {
				console.log(`Retry ${retries}/${MAX_RETRIES} - waiting for ${RETRY_DELAY} ms`)
				await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
			} else {
				console.log('Maximum retries reached. Aborting.')
			}
		}
	}
}

async function scheduleRandomDm(client) {
	while (true) {
		// Get all guilds
		const guilds = client.guilds.cache.values()

		for (const guild of guilds) {
			if (guild.id === process.env.GUILD_ID) {
				await sendRandomDm(guild)
				// Wait between sending messages to different guilds
				await new Promise(resolve => setTimeout(resolve, 60 * 1000))
			}
		}

		// Wait before starting the next round of messages
		await new Promise(resolve => setTimeout(resolve, 3 * 60 * 60 * 1000))
	}
}

async function sendGreeting(user) {
	try {
		const question = `My name is ${user.username}. I'm new to the discord server!  Greet me and tell me about yourself!`
		selectedPersonalityIdx = await getRandomPersonalityIndex()
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx, user.id)
		await user.send(chatbotResponse)
		console.log(`Sent greeting to ${user.username}`)
	} catch (error) {
		console.log(error)
	}
}

module.exports = {
	setPersonalityChoices,
	scheduleRandomDm,
	sendGreeting
}
