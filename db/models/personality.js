const db = require('../../db')

class Personality {
	static getPersonalityContent(index, callback) {
		const query = `SELECT content FROM personalities WHERE id = ?`
		db.get(query, [index], (err, row) => {
			callback(err, row ? row.content : null)
		})
	}

	static getPersonalityIdxLbl(callback) {
		const query = `SELECT id, label FROM personalities`
		db.all(query, [], (err, rows) => {
			callback(err, rows)
		})
	}

	static getTemperatureValue(index, callback) {
		const query = 'SELECT temperature FROM personalities WHERE id = ?'
		db.get(query, [index], (err, row) => {
			callback(err, row ? row.temperature : null)
		})
	}
}

module.exports = Personality
