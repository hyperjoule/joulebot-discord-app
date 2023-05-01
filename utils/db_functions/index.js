// utils/dbFunctions
const { addUser } = require('../../db/userQueries')

async function addAllGuildMembersToDatabase(guild) {
	const members = await guild.members.fetch()
	members.forEach(member => {
		if (!member.user.bot) {
			addUser(member.user)
		}
	})
}

module.exports = {
	addAllGuildMembersToDatabase
}