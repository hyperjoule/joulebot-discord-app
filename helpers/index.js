// helpers
const { handleSend } = require('../api')
const { getPersonalityIdxLbl } = require('../db/userQueries')
const { selectedPersonalityIdx } = require('../command_handlers')

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
		const question = `My name is ${random_member.displayName}. Tell me my fortune.`
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx)
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
		const question = `My name is ${user.displayName}. I'm new to the discord server!  Greet me and tell me about yourself!`
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx)
		await user.send(chatbotResponse)
		console.log(`Sent greeting to ${random_member.displayName}`)
	} catch (error) {
		console.log(error)
	}
}

module.exports = {
	setPersonalityChoices,
	scheduleRandomDm,
	sendGreeting
}
