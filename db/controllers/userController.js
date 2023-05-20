const User = require('../models/user')

exports.addUser = async (user) => {
	try {
		await User.addUser(user)
		console.log(`User added: ${user.username}`)
		return { message: 'User added successfully' }
	} catch (err) {
		console.error(`Error inserting user: ${err.message}`)
		throw err
	}
}

exports.checkUserInDatabase = async (discordId) => {
	try {
		const user = await User.getUserById(discordId)
		return user ? true : false
	} catch (err) {
		console.error(`Error checking user: ${err.message}`)
		throw err
	}
}
