const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "gsearch",
    alias: ["google", "search"],
    desc: "Search Google using GiftedTech API 🌐",
    category: "search",
    react: "🔍",
    use: ".gsearch <query>",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) return reply("🔍 *What should I search?*\n\nUsage: .gsearch some search query");

        reply("🔎 *Searching...*\nHold tight, fetching results from GiftedTech API!");

        const apiUrl = `https://api.giftedtech.co.ke/api/search/google?apikey=gifted&query=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
            return reply("❌ No results found for your query.");
        }

        // Format results nicely
        let txt = `🌐 *Google Search Results for:* "${q}"\n\n`;
        data.results.slice(0, 7).forEach((item, i) => {
            txt += `*${i + 1}. ${item.title}*\n`;
            txt += `${item.description || "No description"}\n`;
            txt += `🔗 ${item.link}\n\n`;
        });

        // Newsletter mention context
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 143,
            },
        };

        await conn.sendMessage(mek.chat, {
            text: txt.trim(),
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error("GSearch Error:", e);
        reply("⚠️ *Oops! Something went wrong while searching.*\nTry again later or with another query.");
    }
});
