// helpers
const { handleSend } = require('../api')
const { getPersonalityIdxLbl, getRandomPersonalityIndex } = require('../db/controllers/personalityController')
const randomPrompts = require('./random_prompts.json')
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
	try {
		const fetchedMembers = await guild.members.fetch({ limit: 100, withPresences: true, time: 30000 })
		const guildMembers = fetchedMembers.filter(member => !member.user.bot)
		const random_member = guildMembers.random()
		const question = `${random_member.displayName} asks: ${getRandomPrompt()}`
		selectedPersonalityIdx = await getRandomPersonalityIndex()
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx, random_member.user.id)
		await random_member.send(chatbotResponse)
		console.log(`Sent random message to ${random_member.displayName}`)
	} catch (error) {
		if (error.code === 'GuildMembersTimeout') {
			console.log("Members didn't arrive in time. Increase the timeout duration if needed.")
		} else {
			console.log(error)
		}
	}
}

async function scheduleRandomDm(client) {
	while (true) {
		const guild = client.guilds.cache.get(process.env.GUILD_ID)
		await sendRandomDm(guild)
		await new Promise(resolve => setTimeout(resolve, 3 * 60 * 60 * 1000))
	}
}

async function sendGreeting(user) {
	try {
		const question = `My name is ${user.username}. I'm new to the discord server!  Greet me and tell me about yourself!`
		selectedPersonalityIdx = await getRandomPersonalityIndex()
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx)
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
