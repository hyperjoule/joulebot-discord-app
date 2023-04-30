const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./joulebot.db');

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    discord_id TEXT UNIQUE,
    username TEXT,
    discriminator TEXT
  )`);
});

module.exports = db;