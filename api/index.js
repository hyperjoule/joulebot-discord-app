// chatbot_api.js
const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios')
const { getPersonalityContent, getTemperatureValue } = require('../db/userQueries')
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
	const lowerText = text.toLowerCase();
	const cleanedText = lowerText.replace(/[^\w\s]|_/g, '')
	const tokens = tokenizer.tokenize(cleanedText)
	const stopwordFreeTokens = sw.removeStopwords(tokens)
	const reducedText = stopwordFreeTokens.join(' ')
	return reducedText
}

const generateImage = async (prompt) => {
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
		console.error('Error generating image:', error)
		if (error.response) {
			console.error('Error response data:', error.response.data)
		}
		return null
	}
}

const handleSend = async (textInput, personalityIdx = 0) => {
	let retries = 0
	let retryDelay = 500

	// Add the user's input message to the conversation history
	const processedTextInput = preprocessText(textInput)
	conversationHistory.push({ role: 'user', content: processedTextInput })
	console.log('Question Raw text:' + textInput)
	console.log('Question Processed: ' + processedTextInput)
	// Limit the conversation history to the last MAX_HISTORY messages
	if (conversationHistory.length > MAX_HISTORY) {
		conversationHistory.shift()
	}

	while (retries < MAX_RETRIES) {
		try {
			const personalityContent = await new Promise((resolve, reject) => {
				getPersonalityContent(personalityIdx, (err, content) => {
					if (err) {
						reject(err)
					} else {
						resolve(content)
					}
				})
			})
			const temperature = await new Promise((resolve, reject) => {
				getTemperatureValue(personalityIdx, (err, value) => {
					if (err) {
						reject(err)
					} else {
						resolve(value)
					}
				})
			})
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

			const text = response.data.choices[0].message.content
			const processedAnswerTextInput = preprocessText(text)
			conversationHistory.push({ role: 'assistant', content: processedAnswerTextInput })
			console.log('Answer Raw text:' + text)
			console.log('Answer Processed: ' + processedAnswerTextInput)
			if (conversationHistory.length > MAX_HISTORY) {
				conversationHistory.shift()
			}
			return text
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
exports.handleSend = handleSend;
exports.generateImage = generateImage;
