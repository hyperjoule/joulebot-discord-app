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
