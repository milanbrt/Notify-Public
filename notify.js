require('dotenv').config();
const { Client, IntentsBitField, REST, Routes } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

const CHANNEL_NAMES = process.env.CHANNEL_NAMES.split(',').map(name => name.trim());
const NOTIFY_USERS = process.env.NOTIFY_USERS.split(',');

const db = new sqlite3.Database('data.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to database');
    db.run(`CREATE TABLE IF NOT EXISTS joined_users (
      user_id TEXT,
      username TEXT,
      timestamp TEXT,
      channel_name TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err);
      }
    });
  }
});

const commands = [
  {
    name: 'test',
    description: 'Replies with a test message',
  },
];

client.once('ready', async () => {
  console.log('Bot is ready!');

  // Register commands after the bot is ready
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

const RATE_LIMIT = 10 * 60 * 1000; // 10 minutes
const lastMessageTimestamps = new Map();
const lastVoiceStateUpdateTimestamps = new Map();

client.on('messageCreate', message => {
  if (message.author.bot) {
    message.delete({ timeout: 2 * 60 * 60 * 1000 }).catch(console.error);
    return;
  }

  const now = Date.now();
  const lastMessageTimestamp = lastMessageTimestamps.get(message.author.id);

  if (lastMessageTimestamp && now - lastMessageTimestamp < RATE_LIMIT) {
    return;
  }

  lastMessageTimestamps.set(message.author.id, now);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const newChannel = newState.channel;
µ
  if (newChannel && CHANNEL_NAMES.some(name => newChannel.name.toLowerCase().includes(name))) {
    const user = newState.member;
    const userId = user.id;
    const username = user.displayName;
    const now = Date.now();
    const lastVoiceStateUpdateTimestamp = lastVoiceStateUpdateTimestamps.get(userId);
	console.log("Time since last join: " + now - lastVoiceStateUpdateTimestamp);
    if (lastVoiceStateUpdateTimestamp && now - lastVoiceStateUpdateTimestamp < RATE_LIMIT) {
      console.log(`Voice state update ignored for ${userId}, rate limit exceeded.`);
      return;
    }

    lastVoiceStateUpdateTimestamps.set(userId, now);

    const timestamp = new Date().toISOString();
    const channelName = newChannel.name;

    db.run(`INSERT INTO joined_users (user_id, username, timestamp, channel_name) VALUES (?, ?, ?, ?)`,
      [userId, username, timestamp, channelName], (err) => {
        if (err) {
          console.error('Error logging to database', err);
        }
      });

    NOTIFY_USERS.forEach(userID => {
      const notifyUser = newState.guild.members.cache.get(userID);
      if (notifyUser) {
        notifyUser.send(`Hey, ${notifyUser.displayName}! ${user.displayName} has joined ${channelName} voice channel.`)
          .catch(error => console.log(`Failed to send message to user ${userID}: ${error}`));
      }
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'test') {
    await interaction.reply('Test command received!');
  }
});

client.login(process.env.BOT_TOKEN);
