const Personality = require('../models/personality')
const db = require('../../db')

exports.getContentValue = (index) => {
	return new Promise((resolve, reject) => {
		Personality.getContentValue(index, (err, content) => {
			if (err) {
				console.error(`Error fetching personality content: ${err.message}`)
				reject(err)
			} else {
				resolve(content)
			}
		})
	})
}

exports.getLabelValue = (index) => {
	return new Promise((resolve, reject) => {
		Personality.getLabelValue(index, (err, label) => {
			if (err) {
				console.error(`Error fetching personality content: ${err.message}`)
				reject(err)
			} else {
				resolve(label)
			}
		})
	})
}

exports.getTemperatureValue = (index) => {
	return new Promise((resolve, reject) => {
		Personality.getTemperatureValue(index, (err, value) => {
			if (err) {
				console.error(`Error fetching temperature value: ${err.message}`)
				reject(err)
			} else {
				resolve(value)
			}
		})
	})
}

exports.getRandomPersonalityIndex = async () => {
	try {
		const numRows = await new Promise((resolve, reject) => {
			const query = 'SELECT COUNT(*) AS count FROM personalities'
			db.get(query, (err, row) => {
				if (err) {
					reject(err)
				} else {
					resolve(row.count)
				}
			})
		})

		const randomIndex = Math.floor(Math.random() * numRows)
		return randomIndex
	} catch (err) {
		console.error(`Error fetching random personality index: ${err.message}`)
		throw err
	}
}

exports.getPersonalityIdxLbl = (callback) => {
	const query = `SELECT id, label FROM personalities`
	db.all(query, [], (err, rows) => {
		if (err) {
			console.error(`Error fetching personalities: ${err.message}`)
			callback(err, null)
		} else {
			callback(null, rows)
		}
	})
}
