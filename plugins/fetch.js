const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "fetch",
    alias: ["get", "api", "fetchapi", "apifetch"],
    desc: "Fetch data from a provided URL or API",
    category: "main",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, args, reply }) => {
    try {
        const q = args.join(' ').trim(); // Extract the URL or API query
        if (!q) return safeReply(conn, mek.key.remoteJid, '❌ Please provide a valid URL or query.');

        if (!/^https?:\/\//.test(q)) return safeReply(conn, mek.key.remoteJid, '❌ URL must start with http:// or https://.');

        const data = await fetchJson(q); // Use your fetchJson utility function to get data
        const content = JSON.stringify(data, null, 2);

        await safeSend(conn, from, {
            text: `🔍 *Fetched Data*:\n\`\`\`${content.slice(0, 2048)}\`\`\`\n\n📢 *BY HANS BYTE MD*`,
            contextInfo: {
                mentionedJid: [],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "120363422794491778@newsletter", // Example newsletter JID
                  newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
                  serverMessageId: 143,
            }
        },  quoted: mek });

    } catch (e) {
        console.error("Error in fetch command:", e);
        safeReply(conn, mek.key.remoteJid, `❌ An error occurred:\n${e.message}\n\n📢 *BY HANS BYTE MD*`);
    }
});