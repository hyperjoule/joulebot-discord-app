// db/index.js
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/joulebot.db')

module.exports = db
