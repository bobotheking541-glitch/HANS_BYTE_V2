const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "happymod",
    alias: ["hm", "modapk"],
    desc: "📲 Search HappyMod apps",
    category: "search",
    react: "📦",
    use: ".happymod <app name>",
    filename: __filename,
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) {
            return safeReply(conn, mek.key.remoteJid, 
`┌─❖ 📦 *HANS BYTE HAPPYMOD* 📦
│
├  🔍 Use:  *.happymod <app name>*
│
└─❖ Example: *.happymod WhatsApp*`
            );
        }

        safeReply(conn, mek.key.remoteJid, "⚡ *Searching HappyMod apps...* 🔎");

        const apiUrl = `https://api.giftedtech.co.ke/api/search/happymod?apikey=gifted_api_6kuv56877d&query=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data.success || data.results?.status === false) {
            return safeReply(conn, mek.key.remoteJid, "😵 *No apps found!* Try another keyword.");
        }

        const results = Array.isArray(data.results) ? data.results : [data.results];

        for (let app of results) {
            await safeSend(conn, mek.chat, {
                text: 
`┌─❖ 📦 *HAPPYMOD RESULT* 📦
│
├  🔎 Query: *${q}*
├  📱 App: *${app.title || "Unknown"}*
├  📝 Info: ${app.description || "No description"}
├  🔗 Link: ${app.link || "N/A"}
│
└─❖ Powered by HANS BYTE ⚡`,
                contextInfo: {
                    externalAdReply: {
                        title: "HANS BYTE HappyMod Finder",
                        body: "✨ Get Modded Apps Safely ✨",
                        mediaType: 1,
                        thumbnailUrl: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png", 
                        sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("HappyMod Error:", e.response?.status, e.response?.data || e.message);
        safeReply(conn, mek.key.remoteJid, "💥 *Oops!* Something went wrong fetching HappyMod results.\nTry again later.");
    }
});
