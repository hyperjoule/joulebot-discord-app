const db = require('../../db')

class UserSetting {
	static addSetting(user) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare(`INSERT OR IGNORE INTO user_settings (discord_id, personality_id) VALUES (?, 0)`)
			stmt.run(user.id, (err) => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
			stmt.finalize()
		})
	}

	static updatePersonalityId(discordId, personalityIdx) {
		return new Promise((resolve, reject) => {
			const query = `UPDATE user_settings SET personality_id = ? WHERE discord_id = ?`
			db.run(query, [personalityIdx, discordId], (err) => {
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}
}

module.exports = UserSetting
