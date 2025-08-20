const os = require('os')
const config = require('../config')
const { cmd, commands } = require('../command')

// Uptime function
function formatUptime(seconds) {
    const pad = (s) => (s < 10 ? '0' : '') + s;
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`
}

cmd({
    pattern: "alive",
    react: "🛸",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, {
    from, reply
}) => {
    try {
        const uptimeSeconds = process.uptime()
        const uptime = formatUptime(uptimeSeconds)
        const caption = `🛰️ *HANS BYTE V2 is Online!*\n\n` +
                        `🤖 *Status:* BETA\n` +
                        `⏱️ *Uptime:* ${uptime}\n` +
                        `🌐 *Host:* ${os.hostname()}\n` +
                        `💻 *Platform:* ${os.platform()} ${os.arch()}\n` +
                        `📦 *Memory:* ${Math.round(os.freemem() / 1024 / 1024)}MB free / ${Math.round(os.totalmem() / 1024 / 1024)}MB total\n\n` +
                        `🧠 *Created by:* Hans Tech\n` +
                        `🚀 *Powering conversations globally*\n\n` +
                        `✨ Type *${config.PREFIX}menu* to get started!`

        return await conn.sendMessage(from, {
            image: {
                url: "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg"
            },
            caption: caption
        }, { quoted: mek })

    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
