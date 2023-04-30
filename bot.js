const dotenv = require('dotenv');
dotenv.config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { handleSend, generateImage } = require('./chatbot_api');
const { personalityTitles } = require('./personalities');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let selectedPersonalityIdx = 0;

client.on('ready', async () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);

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

	console.log('Registered slash commands:', commands);
});

async function handleAskCommand(interaction) {
	await interaction.deferReply();
	const userName = interaction.member.displayName;
	const userInput = interaction.options.getString('question');
	const chatbotResponse = await handleSend(userInput, selectedPersonalityIdx);
	await interaction.editReply(`**${userName} asks:** ${userInput}\n\n**Joulebot:** ${chatbotResponse}`);
}

async function handleDrawCommand(interaction) {
	await interaction.deferReply();
	const userName = interaction.member.displayName;
	const imageDescription = interaction.options.getString('description');
	const imageUrl = await generateImage(imageDescription);
	if (imageUrl) {
		const imageEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`**${userName} requested:** ${imageDescription}`)
			.setImage(imageUrl);
		await interaction.editReply({ embeds: [imageEmbed] });
	} else {
		await interaction.editReply("I'm sorry, but I'm having trouble generating an image right now. Please try again later.");
	}
}

async function handlePersonalityCommand(interaction) {
	selectedPersonalityIdx = parseInt(interaction.options.getString('choice'));
	await interaction.reply(`Personality set to: ${personalityTitles[selectedPersonalityIdx].label}`);
}

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