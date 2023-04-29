// bot.js

const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { handleSend } = require('./chatbot_api');

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.on('ready', async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);

	// Register slash commands
	const commands = await client.guilds.cache.get(process.env.GUILD_ID)?.commands.set([
		{
			name: 'ask',
			description: 'Ask a question to the bot',
			options: [
				{
					name: 'question',
					type: 3, // STRING
					description: 'Your question',
					required: true
				}
			]
		}
	]);

	console.log('Registered slash commands:', commands);
});

client.on('interactionCreate', async interaction => {
	console.log('Interaction received:', interaction.commandName);
	if (!interaction.isCommand() && interaction.type !== 'MESSAGE_COMPONENT') return;

	switch (interaction.commandName) {
	case 'ask':
		await interaction.deferReply();
		const userInput = interaction.options.getString('question');
		const chatbotResponse = await handleSend(userInput);
		await interaction.editReply(chatbotResponse);
		break;
	}
});

client.login(process.env.BOT_TOKEN);