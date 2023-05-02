// db/userQueries.js
const db = require('./index.js')

function addUser(user) {
	const stmt = db.prepare(`INSERT OR IGNORE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`)
	stmt.run(user.id, user.username, user.discriminator, (err) => {
		if (err) {
			console.error(`Error inserting user: ${err.message}`)
		} else {
			console.log(`User added: ${user.username}`)
		}
	})
	stmt.finalize()
}

function addSettings(user) {
	const stmt = db.prepare(`INSERT OR IGNORE INTO user_settings (discord_id, personality_id) VALUES (?, 0)`)
	stmt.run(user.id, (err) => {
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

function updatePersonalityId(discordId, personalityIdx, callback) {
	const query = `UPDATE user_settings SET personality_id = ? WHERE discord_id = ?`
	db.run(query, [personalityIdx, discordId], (err) => {
		if (err) {
			console.error(`Error updating personality_id: ${err.message}`)
			callback(err)
		} else {
			console.log(`Personality_id updated for discord_id: ${discordId}`)
			callback(null)
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

async function prepopulateUserSettings () {
	console.log('user settings')
	db.all('SELECT discord_id FROM users', (err, rows) => {
		if (err) {
			console.error(err)
			return
		}

		rows.forEach(row => {
			db.run(`INSERT OR IGNORE INTO user_settings (discord_id, personality_id) VALUES (?, 0)`, [row.discord_id], (err) => {
				if (err) {
					console.error(err)
					return
				}
			})
		})
	})
}

module.exports = {
	addUser,
	addSettings,
	getPersonalityIdxLbl,
	getPersonalityContent,
	getTemperatureValue,
	prepopulateUserSettings,
	updatePersonalityId
}
