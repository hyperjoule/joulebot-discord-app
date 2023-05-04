// api
const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios')
const chatLogController = require('../db/controllers/chatLogController')
const { getContentValue, getTemperatureValue, getLabelValue } = require('../db/controllers/personalityController')
const API_KEY = process.env.API_KEY
const MODEL = 'gpt-3.5-turbo' // default.  can override with useModel passed to handleSend
const MAX_TOKENS = 1500
const MAX_HISTORY = 10 
const MAX_RETRIES = 3
const conversationHistory = []
const { isUnicodeEmoji, getRandomThinkingEmoji } = require('../helpers')

// Approximate token count of string
const getTokenCount = (text) => {
	const words = text.split(/\s+/)
	let tokens = 0
	for (const word of words) {
		tokens += word.length + 1 // Add 1 for the whitespace after each word
	}
	return tokens
}

const handleSend = async (textInput, personalityIdx = 0, discordId, useModel=MODEL) => {
	let retries = 0
	let retryDelay = 1000

	// Fetch the last MAX_HISTORY-1 number of responses from the database for the specific user
	const lastConversations = await chatLogController.getLastConversations(discordId, MAX_HISTORY-1)
	// Populate the conversation history
	conversationHistory.length = 0 // Clear the current conversation history
	lastConversations.forEach((conv) => {
		conversationHistory.push({ role: 'user', content: conv.initial_question })
		conversationHistory.push({ role: 'assistant', content: conv.answer })
	})

	// Add the user's input message to the conversation history
	conversationHistory.push({ role: 'user', content: textInput })
	console.log('Question:' + textInput)

	// Limit the conversation history to the last MAX_HISTORY messages
	if (conversationHistory.length > MAX_HISTORY) {
		conversationHistory.shift()
	}

	// Count tokens in the conversationHistory array
	let totalTokens = conversationHistory.reduce((sum, message) => {
		return sum + getTokenCount(message.content)
	}, 0)

	// Limit the conversation history based on token count
	while (totalTokens > MAX_TOKENS) {
		const removedMessage = conversationHistory.shift()
		totalTokens -= getTokenCount(removedMessage.content)
	}

	while (retries < MAX_RETRIES) {
		try {
			const personalityContent = await getContentValue(personalityIdx)
			const temperature = await getTemperatureValue(personalityIdx)	
			const personalityLabel = await getLabelValue(personalityIdx)
  		
			const messages = [
				{
					role: 'system',
					content: personalityContent
				},
				...conversationHistory
			]
			const response = await axios.post(
				'https://api.openai.com/v1/chat/completions',
				{
					messages,
					model: useModel,
					max_tokens: MAX_TOKENS,
					frequency_penalty: 0.5,
					presence_penalty: 1,
					n: 1,
					stop: null,
					temperature: temperature
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${API_KEY}`
					}
				}
				
			)
			const promptTokens = response.data.usage.prompt_tokens
			const completionTokens = response.data.usage.completion_tokens
			const totalTokens = response.data.usage.total_tokens
			const text = response.data.choices[0].message.content
			console.log('Answer:' + text)

			// Prepare data for insertion into the database
			const dataToInsert = {
				discord_id: discordId, 
				initial_question: textInput, 
				answer: text, 
				prompt_tokens: promptTokens,
				completion_tokens: completionTokens,
				total_tokens: totalTokens,
				personality_id: personalityIdx,
				temperature: temperature
			}

			try {
				// Insert the chat log data into the database
				await chatLogController.addChatLog(dataToInsert)
				console.log('Chat log data inserted successfully')
			} catch (err) {
				console.error('Error inserting chat log data:', err)
			}	

			const formattedResponse = `**${personalityLabel}**\n${text}`
			return formattedResponse
			
		} catch (error) {
			if (
				error?.response?.data?.error?.message?.includes('maximum context length is')
			) {
				conversationHistory.shift()
			} else if (error?.response?.status === 429) {
				console.log(`Retry ${retries + 1}/${MAX_RETRIES} - waiting for ${retryDelay} ms`)
				await new Promise((resolve) => setTimeout(resolve, retryDelay))
				retryDelay *= 2 // Increase the delay for the next retry
			} else if (error?.response?.status === 503) {
				// Handle the 503 Service Unavailable error
				console.error('The server is temporarily unavailable. Please try again later.')
				break
			} else {
				console.error(error)
				break
			}
		}

		retries += 1
		if (retries < MAX_RETRIES) {
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}

	// If all retries failed, return an error message
	return "I'm sorry, but I'm having trouble connecting right now. Please try again later."
}

const getEmojiReaction = async (messageContent) => {
	try {
		const response = await axios.post(
			'https://api.openai.com/v1/chat/completions',
			{
				messages: [
					{ role: 'user', content: messageContent },
					{ role: 'assistant', content: 'React with a unicode emoji to this message' }
				],
				model: 'gpt-3.5-turbo', // this needs to be at least gpt-3.5
				max_tokens: 10
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${API_KEY}`
				}
			}
		)
		const responseContent = response.data.choices[0].message.content.trim()
		const characters = [...responseContent]

		// Find the first valid emoji character in the response
		const emoji = characters.find(char => isUnicodeEmoji(char))
		console.log(`Emoji react: ${emoji}`)
		return emoji || getRandomThinkingEmoji()

	} catch (error) {
		// If the AI messes up, log the error
		console.error(error)
		return getRandomThinkingEmoji() 
	}

}

const generateImage = async (prompt, discordId) => {
	try {
		const response = await axios.post(
			'https://api.openai.com/v1/images/generations',
			{
				model: 'image-alpha-001',
				prompt,
				num_images: 1,
				size: '512x512',
				response_format: 'url'
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${API_KEY}`
				}
			}
		)

		if (response.status === 200) {
			return response.data.data[0].url
		}
	} catch (error) {
		console.error(error)
	}
}

exports.handleSend = handleSend
exports.generateImage = generateImage
exports.getEmojiReaction = getEmojiReaction
