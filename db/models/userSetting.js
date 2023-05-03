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

	static getPersonalityIdByDiscordId(discord_id) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare('SELECT personality_id FROM user_settings WHERE discord_id = ?')
			stmt.get(discord_id, (err, result) => {
				if (err) {
					reject(err)
				} else {
					resolve(result ? result.personality_id : null)
				}
			})
		})
	}
}

module.exports = UserSetting
