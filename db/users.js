// db/users.js
const db = require('./index');

db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    discord_id TEXT UNIQUE,
    username TEXT,
    discriminator TEXT
  )`)
})
