const Personality = require('../models/personality')

exports.getPersonalityContent = (req, res) => {
	const index = req.params.index
	Personality.getPersonalityContent(index, (err, content) => {
		if (err) {
			console.error(`Error fetching personality content: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
		res.status(200).json({ content })
	})
}

exports.getPersonalityIdxLbl = (req, res) => {
	Personality.getPersonalityIdxLbl((err, rows) => {
		if (err) {
			console.error(`Error fetching personalities: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
		res.status(200).json({ personalities: rows })
	})
}

exports.getTemperatureValue = (req, res) => {
	const index = req.params.index
	Personality.getTemperatureValue(index, (err, temperature) => {
		if (err) {
			console.error(`Error fetching temperature: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
		res.status(200).json({ temperature })
	})
}
