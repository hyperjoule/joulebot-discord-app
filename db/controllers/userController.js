const User = require('../models/user')

exports.addUser = (req, res) => {
	const user = req.body.user
	User.addUser(user, (err) => {
		if (err) {
			console.error(`Error inserting user: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
		console.log(`User added: ${user.username}`)
		res.status(201).json({ message: 'User added successfully' })
	})
}