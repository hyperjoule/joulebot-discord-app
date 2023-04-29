const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { handleSend, generateImage } = require('./chatbot_api');
const client = new Client({intents: [GatewayIntentBits.Guilds]});
const dotenv = require('dotenv');
dotenv.config();

client.on('ready', async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);

	// Register slash commands
	const commands = await client.guilds.cache.get(process.env.GUILD_ID)?.commands.set([
		{
			name: 'ask',
			description: 'Ask Joulebot 2.0 anything!',
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
		imageTitle = userInput;
		const chatbotResponse = await handleSend(userInput);
		await interaction.editReply(chatbotResponse);
		break;
	case 'draw':
		await interaction.deferReply();
		const imageDescription = interaction.options.getString('description');
		const imageUrl = await generateImage(imageDescription);
		if (imageUrl) {
			const imageEmbed = new EmbedBuilder ()
				.setColor('#0099ff')
				.setTitle(interaction.options.getString('description'))
				.setImage(imageUrl);
			await interaction.editReply({ embeds: [imageEmbed] });
		} else {
			await interaction.editReply("I'm sorry, but I'm having trouble generating an image right now. Please try again later.");
		}
		break;
	}
});

client.login(process.env.BOT_TOKEN);
