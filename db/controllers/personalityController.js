const Personality = require('../models/personality')

exports.getPersonalityContent = (index) => {
	return new Promise((resolve, reject) => {
		Personality.getPersonalityContent(index, (err, content) => {
			if (err) {
				console.error(`Error fetching personality content: ${err.message}`)
				reject(err)
			} else {
				resolve(content)
			}
		})
	})
}

exports.getPersonalityIdxLbl = (callback) => {
	console.log('getPersonalityIdxLbl: start')
	Personality.getPersonalityIdxLbl((err, rows) => {
		if (err) {
			console.error('getPersonalityIdxLbl: error', err.message)
			callback(err, null)
		} else {
			console.log('getPersonalityIdxLbl: success')
			callback(null, rows)
		}
	})
}

exports.getTemperatureValue = (index) => {
	return new Promise((resolve, reject) => {
		Personality.getTemperatureValue(index, (err, temperature) => {
			if (err) {
				console.error(`Error fetching temperature: ${err.message}`)
				reject(err)
			} else {
				resolve(temperature)
			}
		})
	})
}
