const db = require('./index')

// Import the JSON data from the personalities.json file
const personalities = require('./personalities.json')

const initDb = async () => {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          discord_id TEXT UNIQUE,
          username TEXT,
          discriminator TEXT
        )
      `)

			db.run(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY,
          discord_id TEXT UNIQUE,
          personality_id INTEGER DEFAULT 0,
          FOREIGN KEY (discord_id) REFERENCES users (discord_id),
          FOREIGN KEY (personality_id) REFERENCES personalities (id)
        )
      `)

			db.run(`
        CREATE TABLE IF NOT EXISTS personalities (
          id INTEGER PRIMARY KEY,
          label TEXT,
          content TEXT,
          temperature REAL
        )
      `)

			// Prepare the SQL statement for inserting data into the personalities table
			const stmt = db.prepare('INSERT OR IGNORE INTO personalities (id, label, content, temperature) VALUES (?, ?, ?, ?)')

			// Iterate over the JSON data and insert each personality into the table
			for (const personality of personalities) {
				stmt.run(personality.id, personality.label, personality.content, personality.temperature)
			}

			stmt.finalize()

			db.each('SELECT id, label, content, temperature FROM personalities', (err, row) => {
				if (err) {
					console.error(err)
					reject(err)
					return
				}
				console.log(row.id + ': ' + row.label + ' - ' + row.content + ' - ' + row.temperature)
			})
			resolve()
		})
	})
}

module.exports = initDb
