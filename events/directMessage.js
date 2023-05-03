const { handleDirectMessage } = require('../commandHandlers')

module.exports = {
	name: 'messageCreate',
	execute(message, client) {
		// Ignore messages from bots
		if (message.author.bot) return

		// Check if the message is a direct message
		if (message.channel.type === 'DM') {
			// Call the handleDirectMessage function to handle the direct message
			handleDirectMessage(message, client)
		}
	}
}
