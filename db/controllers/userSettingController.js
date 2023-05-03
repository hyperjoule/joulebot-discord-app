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

exports.getPersonalityIdByDiscordId = async (discord_id) => {
	try {
		const personalityId = await UserSetting.getPersonalityIdByDiscordId(discord_id)
		console.log(`Personality ID retrieved for discord_id: ${discord_id} - Personality ID: ${personalityId}`)
		return personalityId
	} catch (err) {
		console.error(`Error retrieving personality ID: ${err.message}`)
		throw err
	}
}

exports.updatePersonalityId = async (discord_id, personalityId) => {
	try {
		await UserSetting.updatePersonalityId(discord_id, personalityId)
		console.log(`User personality updated: ${discord_id} - Personality ID: ${personalityId}`)
		return { message: 'User personality updated successfully' }
	} catch (err) {
		console.error(`Error updating user personality: ${err.message}`)
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
