// api
const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios')
const chatLogController = require('../db/controllers/chatLogController')
const { getContentValue, getTemperatureValue, getLabelValue } = require('../db/controllers/personalityController')
const natural = require('natural')
const tokenizer = new natural.WordTokenizer()
const sw = require('stopword')
const API_KEY = process.env.API_KEY
const MODEL = 'gpt-4' // change to whatever model you are using - see powershell script model_list.sh
const MAX_TOKENS = 3000
const MAX_HISTORY = 15 // I've played with this a bit but 10 seems to work well with the token limit 1500 for gpt-3.5-turbo
const MAX_RETRIES = 3
const conversationHistory = []

const preprocessText = (text) => {
	const lowerText = text.toLowerCase()
	const cleanedText = lowerText.replace(/[^\w\s]|_/g, '')
	const tokens = tokenizer.tokenize(cleanedText)
	const stopwordFreeTokens = sw.removeStopwords(tokens)
	const reducedText = stopwordFreeTokens.join(' ')
	return reducedText
}

const handleSend = async (textInput, personalityIdx = 0, discordId) => {
	let retries = 0
	let retryDelay = 500

	// Add the user's input message to the conversation history
	const processedTextInput = preprocessText(textInput)
	conversationHistory.push({ role: 'user', content: processedTextInput })
	console.log('Question:' + textInput)
	// Limit the conversation history to the last MAX_HISTORY messages
	if (conversationHistory.length > MAX_HISTORY) {
		conversationHistory.shift()
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
					model: MODEL,
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
			const processedAnswerTextInput = preprocessText(text)
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
			conversationHistory.push({ role: 'assistant', content: processedAnswerTextInput })
			console.log('Answer:' + text)
			if (conversationHistory.length > MAX_HISTORY) {
				conversationHistory.shift()
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
