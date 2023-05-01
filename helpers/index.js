const { handleSend } = require('../api');
const { selectedPersonalityIdx } = require('../command_handlers');

async function send_random_dm(guild) {
	try {
		const fetchedMembers = await guild.members.fetch({ limit: 100, withPresences: true, time: 30000 });
		const guildMembers = fetchedMembers.filter(member => !member.user.bot);
		const random_member = guildMembers.random();
		const question = `My name is ${random_member.displayName}. Tell me an interesting story with emojis to brighten my day.`;
		const chatbotResponse = await handleSend(question, selectedPersonalityIdx);
		await random_member.send(chatbotResponse);
		console.log(`Sent random message to ${random_member.displayName}`);
	} catch (error) {
		if (error.code === 'GuildMembersTimeout') {
			console.log("Members didn't arrive in time. Increase the timeout duration if needed.");
		} else {
			console.log(error);
		}
	}
}

async function schedule_random_dm(client) {
	while (true) {
		const guild = client.guilds.cache.get(process.env.GUILD_ID);
		await send_random_dm(guild);
		await new Promise(resolve => setTimeout(resolve, 3 * 60 * 60 * 1000));
	}
}

module.exports = {
	schedule_random_dm
};