// Replace with your bot's Discord ID
const botId = '1101970262804664320'

export const removeBotMention = (messageContent, botId) => {
	// Create a regular expression to match the mention format
	const mentionRegex = new RegExp(`<@!?${botId}>`, 'g')
	// Replace the mention with an empty string
	const cleanedContent = messageContent.replace(mentionRegex, '').trim()
	return cleanedContent
}

 