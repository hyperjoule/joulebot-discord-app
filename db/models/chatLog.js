const db = require('../../db')

class ChatLog {
	static addChatLog(chatLog) {
		return new Promise((resolve, reject) => {
			const stmt = db.prepare(`
        INSERT INTO chat_logs (
          discord_id, initial_question, answer,
          prompt_tokens, completion_tokens, total_tokens,
          personality_id, temperature, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
			stmt.run(
				chatLog.discord_id, chatLog.initial_question, chatLog.answer,
				chatLog.prompt_tokens, chatLog.completion_tokens, chatLog.total_tokens,
				chatLog.personality_id,chatLog.temperature, chatLog.timestamp,
				(err) => {
					if (err) {
						reject(err)
					} else {
						resolve()
					}
				}
			)
			stmt.finalize()
		})
	}
}

module.exports = ChatLog