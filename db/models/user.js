const db = require('../../db')

class User {
	static addUser(user, callback) {
		const stmt = db.prepare(`INSERT OR IGNORE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`)
		stmt.run(user.id, user.username, user.discriminator, (err) => {
			callback(err)
		})
		stmt.finalize()
	}
}

module.exports = User
