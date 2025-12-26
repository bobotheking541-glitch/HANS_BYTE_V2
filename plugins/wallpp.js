const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "wallpaper",
    alias: ["wall", "wpaper"],
    desc: "🌅 Search and fetch HD wallpapers",
    category: "search",
    react: "🖼️",
    use: ".wallpaper <query>",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) {
            return safeReply(conn, mek.key.remoteJid, 
`┌─❖ 🖼️ *HANS BYTE WALLPAPER* 🖼️
│
├  🌅 Use:  *.wallpaper <query>*
│
└─❖ Example: *.wallpaper Sunset Scenes*`
            );
        }

        safeReply(conn, mek.key.remoteJid, "⚡ *Fetching stunning wallpapers...* ✨");

        const apiUrl = `https://api.giftedtech.co.ke/api/search/wallpaper?apikey=gifted_api_6kuv56877d&query=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl);
        const data = res.data;

        if (!data.success || !data.results?.length)
            return safeReply(conn, mek.key.remoteJid, "😵 *No wallpapers found!* Try another keyword.");

        // Pick 5 random wallpapers
        const shuffled = data.results.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 201,
            },
        };

        for (let wp of selected) {
            const imgHD = wp.image?.[0]; // full HD image
            if (!imgHD) continue;

            await safeSend(conn, mek.chat, {
                image: { url: imgHD },
                caption: 
`┌─❖ 🌅 *WALLPAPER FOUND* 🌅
│
├  🔎 Query: *${q}*
├  📂 Category: *${wp.type || "Unknown"}*
├  🔗 Source: [Click Here](${wp.source})
│
└─❖ Powered by HANS BYTE ⚡`,
                contextInfo: {
                    ...newsletterContext,
                    externalAdReply: {
                        title: "HANS BYTE Wallpaper Finder",
                        body: "✨ Stunning Wallpapers, Just for You ✨",
                        mediaType: 1,
                        thumbnailUrl: imgHD,
                        sourceUrl: wp.source
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Wallpaper Error:", e.response?.status, e.response?.data || e.message);
        safeReply(conn, mek.key.remoteJid, "💥 *Oops!* Something went wrong fetching wallpapers.\nTry again later.");
    }
});
