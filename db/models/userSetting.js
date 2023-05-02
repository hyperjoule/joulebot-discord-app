const db = require('../../db')

class UserSetting {
	static addSetting(user, callback) {
		const stmt = db.prepare(`INSERT OR IGNORE INTO user_settings (discord_id, personality_id) VALUES (?, 0)`)
		stmt.run(user.id, (err) => {
			callback(err)
		})
		stmt.finalize()
	}
}

module.exports = UserSetting