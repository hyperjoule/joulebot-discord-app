// db/userQueries.js
const db = require('./index.js')

function addUser(user) {
	const stmt = db.prepare(`INSERT OR IGNORE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`);
	stmt.run(user.id, user.username, user.discriminator, (err) => {
		if (err) {
			console.error(`Error inserting user: ${err.message}`)
		} else {
			console.log(`User added: ${user.username}`)
		}
	})
	stmt.finalize()
}

function getPersonalityContent(index, callback) {
	const query = `SELECT content FROM personalities WHERE id = ?`
	db.get(query, [index], (err, row) => {
		if (err) {
			console.error(`Error fetching personality content: ${err.message}`)
			callback(err, null)
		} else {
			callback(null, row.content)
		}
	})
}

function getPersonalityIdxLbl(callback) {
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

const getTemperatureValue = (index, callback) => {
	const query = 'SELECT temperature FROM personalities WHERE id = ?'
	db.get(query, [index], (err, row) => {
		if (err) {
			return callback(err, null)
		}
		callback(null, row.temperature)
	})
}

module.exports = {
	addUser,
	getPersonalityIdxLbl,
	getPersonalityContent,
	getTemperatureValue
}
