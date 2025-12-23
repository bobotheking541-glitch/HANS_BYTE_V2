const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "book",
    react: "📘",
    desc: "Generate book-style image with text",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, reply
}) => {
    try {
        if (!q) return reply("❗Please provide some text.\n\nExample: *.book DavidCyril*")
        const url = `https://apis.davidcyriltech.my.id/generate/book?text=${encodeURIComponent(q)}&size=35`
        await conn.sendMessage(from, {
            image: { url },
            caption: `📝 Book generated for: ${q}`
        }, { quoted: mek })
    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message}`)
    }
})