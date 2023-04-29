import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  InteractionType,
  MessageFlags,
  Client,
} from '@discordjs/core';
import dotenv from 'dotenv';

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

const gateway = new WebSocketManager({
  token: process.env.BOT_TOKEN,
  intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
  if (interaction.type !== InteractionType.ApplicationCommand || interaction.data.name !== 'ping') {
    return;
  }

  await api.interactions.reply(interaction.id, interaction.token, { content: 'Pong!', flags: MessageFlags.Ephemeral });
});

client.once(GatewayDispatchEvents.Ready, async () => {
  console.log('Ready!');

  // Iterate over all guilds
  client.guilds.cache.forEach(async (guild) => {
    // Try to find a channel named 'general'
    const generalChannel = guild.channels.cache.find(channel => channel.name === 'general' && channel.type === 'GUILD_TEXT');

    // If a 'general' channel was found, send a message
    if (generalChannel) {
      await generalChannel.send('I am online!'); 
    }
  });
});

gateway.connect();
