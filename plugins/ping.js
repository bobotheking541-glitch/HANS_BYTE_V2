const config = require('../config');
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "ping",
    alias: ["🚀", "pong"],
    use: '.ping4',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = Date.now();

        // Emojis for spice
        const reactionEmojis = ['⚡', '🚀', '🔥', '💨', '✨'];
        const chosenReact = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];

        // Send reaction emoji
        await safeSend(conn, from, {
            react: { text: chosenReact, key: mek.key }
        });

        const end = Date.now();
        const responseTime = end - start;

        const uptime = runtime(process.uptime());
        const finalMsg = `*👋 HELLO @${sender.split('@')[0]}!*
        
*🤖 BOT IS ONLINE!*
*📡 PING:* \`${responseTime} ms\`
*⏱ UPTIME:* \`${uptime}\`

🔹 *HANS BYTE*
`;

        await safeSend(conn, from, {
            text: finalMsg,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Ping command error:", e);
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message}`);
    }
});
  