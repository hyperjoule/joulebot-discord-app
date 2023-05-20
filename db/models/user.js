const db = require('../../db')

class User {
	
	static getUserById(discordId) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare(`SELECT * FROM users WHERE discord_id = ?`)
			stmt.get(discordId, (err, row) => {
				if (err) {
					reject(err)
				} else {
					resolve(row)
				}
			})
			stmt.finalize()
		})
	}

	static addUser(user) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare(`INSERT OR IGNORE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`)
			stmt.run(user.id, user.username, user.discriminator, (err) => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
			stmt.finalize()
		})
	}
}


module.exports = User
