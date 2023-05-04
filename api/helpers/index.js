const natural = require('natural')
const tokenizer = new natural.WordTokenizer()
const sw = require('stopword')

export const getRandomThinkingEmoji = () => {
	const thinkingEmojis = [
		'🤔', // Thinking face
		'🧐', // Face with monocle
		'💭', // Thought balloon
		'🤨', // Face with raised eyebrow
		'🤷', // Person shrugging
		'🙇', // Person bowing
		'🤯', // Exploding head
		'🧠', // Brain
		'💡' // Light bulb
	]
	const randomIndex = Math.floor(Math.random() * thinkingEmojis.length)
	return thinkingEmojis[randomIndex]
}

export const isUnicodeEmoji = (str) => {
	// Regex pattern to match Unicode emoji characters
	const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
	return emojiRegex.test(str)
}

// not used for the moment - confuses gpt-3.5
export const preprocessText = (text) => {
	const lowerText = text.toLowerCase()
	const cleanedText = lowerText.replace(/[^\w\s]|_/g, '')
	const tokens = tokenizer.tokenize(cleanedText)
	const stopwordFreeTokens = sw.removeStopwords(tokens)
	const reducedText = stopwordFreeTokens.join(' ')
	return reducedText
}
