const ChatLog = require('../models/chatLog')

exports.addChatLog = async (chatLog) => {
	try {
		// Set the current timestamp for the chat log
		chatLog.timestamp = new Date().toISOString()
		await ChatLog.addChatLog(chatLog)
		console.log(`Chat log added for user: ${chatLog.discord_id}`)
		return { message: 'Chat log added successfully' }
	} catch (err) {
		console.error(`Error inserting chat log: ${err.message}`)
		throw err
	}
}

exports.getLastConversations = async (discordId, limit) => {
	try {
		const conversations = await ChatLog.getLastConversations(discordId, limit)
		return conversations
	} catch (err) {
		console.error(`Error fetching last conversations: ${err.message}`)
		throw err
	}
}