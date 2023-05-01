const db = require('../../db');

async function addAllGuildMembersToDatabase(guild) {
	const members = await guild.members.fetch();
	members.forEach(member => {
		if (!member.user.bot) {
			addUserToDatabase(member.user);
		}
	});
}

function addUserToDatabase(user) {
	const stmt = db.prepare(`INSERT OR IGNORE INTO users (discord_id, username, discriminator) VALUES (?, ?, ?)`);
	stmt.run(user.id, user.username, user.discriminator, (err) => {
		if (err) {
			console.error(`Error inserting user: ${err.message}`);
		} else {
			console.log(`User added: ${user.username}`);
		}
	});
	stmt.finalize();
}
module.exports = {
	addUserToDatabase,
	addAllGuildMembersToDatabase
};