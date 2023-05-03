const db = require('../../db')
const UserSetting = require('../models/userSetting')

exports.addSetting = async (user) => {
	try {
		await UserSetting.addSetting(user)
		console.log(`User setting added: ${user.username}`)
		return { message: 'User setting added successfully' }
	} catch (err) {
		console.error(`Error inserting user setting: ${err.message}`)
		throw err
	}
}

exports.prepopulateUserSettings = async () => {
	console.log('user settings')
	try {
		const rows = await new Promise((resolve, reject) => {
			db.all('SELECT discord_id FROM users', (err, rows) => {
				if (err) {
					reject(err)
				} else {
					resolve(rows)
				}
			})
		})

		for (const row of rows) {
			await UserSetting.addSetting({ id: row.discord_id })
		}
	} catch (err) {
		console.error(err)
	}
}
