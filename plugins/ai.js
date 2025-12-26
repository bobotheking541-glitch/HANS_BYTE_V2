const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "mistral",
    alias: ["ai", "chatmistral"],
    react: "🤖",
    desc: "🤖 Chat with Mistral AI",
    category: "💬 AI",
    filename: __filename
}, async (conn, mek, m, { from, q, pushname, reply, sender }) => {
    try {
        // Construct query
        const query = q ? `Hello I am ${pushname} : ${q}` : `Hello I am ${pushname}`;

        const api = `https://api.giftedtech.web.id/api/ai/mistral?apikey=gifted_api_6kuv56877d&q=${encodeURIComponent(query)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.result) 
            return safeReply(conn, mek.key.remoteJid, "⚠️ *Failed to get a response from Mistral AI.*");

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 300,
            }
        };

        // Send AI response as simulated forwarded message
        await safeSend(conn, 
            from,
            { text: `${json.result}`, contextInfo },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while contacting Mistral AI.*\nPlease try again later.");
    }
});
