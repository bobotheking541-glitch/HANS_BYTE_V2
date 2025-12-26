const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ssweb",
    alias: ["screenshot", "webshot"],
    react: "🖼️",
    desc: "📸 Take a screenshot of a website URL",
    category: "🛠️ Tools",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide a website URL to screenshot.*\n\nExample:\n.ssweb https://hans-web.vercel.app");

        // Encode the URL parameter
        const apiUrl = `https://api.giftedtech.co.ke/api/tools/ssweb?apikey=gifted_api_6kuv56877d&url=${encodeURIComponent(q)}`;
        const res = await fetch(apiUrl);

        // The API returns an image directly, so we just send it as image message
        if (!res.ok) return safeReply(conn, mek.key.remoteJid, "🚫 *Failed to get screenshot. Please check the URL and try again.*");

        // Get buffer of image
        const imageBuffer = await res.buffer();

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 203,
            },
        };

        const caption = `
╭━[ *WEBSITE SCREENSHOT* ]━╮
┃ 🌐 *URL:* ${q}
┃ 📸 *Here is your screenshot!*
╰━━━━━━━━━━━━━━━━━━━━╯

🌟 *Powered by HANS BYTE V2*
        `.trim();

        await safeSend(conn, 
            from,
            {
                image: imageBuffer,
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while taking the screenshot.*");
    }
});
