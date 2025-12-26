const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "gimage",
    alias: ["googleimage", "imgsearch", "img"],
    desc: "🔍 Search Google Images in Hans Byte Style 🖼️",
    category: "search",
    react: "📸",
    use: ".gimage <query>",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) {
            return safeReply(conn, mek.key.remoteJid, 
`┌─❖ 📸 *HANS BYTE IMAGE SEARCH* 📸
│
├  🔎 Use:  *.gimage <query>*
│
└─❖ Example: *.gimage Cute Cat*`
            );
        }

        safeReply(conn, mek.key.remoteJid, "⚡ *Fetching cool images...*\n_Just a sec while Hans Byte works its magic!_ ✨");

        const apiUrl = `https://api.giftedtech.co.ke/api/search/googleimage?apikey=gifted_api_6kuv56877d&query=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data.success || !data.results?.length)
            return safeReply(conn, mek.key.remoteJid, "😵 *No images found!* Try a different keyword.");

        // Pick 5 random images from results
        const shuffled = data.results.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
        };

        // Send results one by one
        for (let img of selected) {
            await safeSend(conn, mek.chat, {
                image: { url: img },
                caption: 
`┌─❖ 🖼️ *IMAGE RESULT* 🖼️
│
├  🔎 Query: *${q}*
├  📥 Source: Google Images
│
└─❖ Powered by HANS BYTE ⚡`,
                contextInfo: newsletterContext
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Google Image Error:", e.response?.status, e.response?.data || e.message);
        safeReply(conn, mek.key.remoteJid, "💥 *Oops!* Something went wrong fetching images.\nTry again later.");
    }
});
