const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] }); // Include GatewayIntentBits.GuildMembers
const { handleAskCommand, handleDrawCommand, handlePersonalityCommand } = require('./commandHandlers');
const { schedule_random_dm } = require('./random_dm');

client.on('ready', async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	schedule_random_dm(client);
	// Register slash commands
	const commands = await client.guilds.cache.get(process.env.GUILD_ID)?.commands.set([
		{
			name: 'ask',
			description: 'Ask Joulebot a question!',
			options: [
				{
					name: 'question',
					type: 3, // STRING
					description: 'Your question',
					required: true
				}
			]
		},
		{
			name: 'draw',
			description: 'Have Joulebot request an image from Dall-E!',
			options: [
				{
					name: 'description',
					type: 3, // STRING
					description: 'Description of the image',
					required: true
				}
			]
		},
		{
			name: 'personality',
			description: 'Select a personality for Joulebot',
			options: [
				{
					name: 'choice',
					type: 3, // STRING
					description: 'Choose a personality',
					required: true,
					choices: personalityTitles.map(title => ({ name: title.label, value: title.value }))
				}
			]
		}
	]);
	// console.log('Registered slash commands:', commands);
});

client.on('interactionCreate', async interaction => {
	console.log('Interaction received:', interaction.commandName);
	if (!interaction.isCommand() && interaction.type !== 'MESSAGE_COMPONENT') return;

	switch (interaction.commandName) {
	case 'ask':
		await handleAskCommand(interaction);
		break;   
	case 'draw':
		await handleDrawCommand(interaction);
		break;
	case 'personality':
		await handlePersonalityCommand(interaction);
		break;
	}
});
				
client.login(process.env.BOT_TOKEN);