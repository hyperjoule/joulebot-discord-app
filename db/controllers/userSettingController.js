const db = require('../../db')
const UserSetting = require('../models/userSetting')

exports.addSetting = (req, res) => {
	const user = req.body.user
	UserSetting.addSetting(user, (err) => {
		if (err) {
			console.error(`Error inserting user setting: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
		console.log(`User setting added: ${user.username}`)
		res.status(201).json({ message: 'User setting added successfully' })
	})
}

exports.prepopulateUserSettings = () => {
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