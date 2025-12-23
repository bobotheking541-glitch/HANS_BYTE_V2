const { cmd } = require('../command');
const fetch = require('node-fetch');

const API_KEY = "gifted_api_6kuv56877d";

// ─── SnackVideo Downloader Command ────────────────────────────────
cmd({
    pattern: "snackdl",
    alias: ["snackvideo", "snack"],
    react: "🎥",
    desc: "Download videos from SnackVideo",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a SnackVideo link.\nExample: snackdl https://www.snackvideo.com/...");

        const url = encodeURIComponent(q);
        const res = await fetch(`https://api.giftedtech.co.ke/api/download/snackdl?apikey=${API_KEY}&url=${url}`);
        const data = await res.json();

        if (!data.success || !data.result) return reply("❌ Failed to fetch video.");

        const r = data.result;
        const msg = `
╭━[   *SNACKVIDEO DOWNLOADER*   ]━╮
┃ 🎬 *Title:* ${r.title}
┃ 👤 *Author:* ${r.author}
┃ 👍 *Likes:* ${r.like}
┃ 💬 *Comments:* ${r.comment}
┃ 🔄 *Shares:* ${r.share}
┃ 🧊 *Status:* Download ready!
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        // Send thumbnail + caption
        await conn.sendMessage(m.chat, { image: { url: r.thumbnail }, caption: msg }, { quoted: m });

        // Send video
        await conn.sendMessage(m.chat, { video: { url: r.media }, caption: "🎥 Here’s your SnackVideo!" }, { quoted: m });

    } catch (err) {
        console.error(err);
        reply("❌ Error while downloading SnackVideo.");
    }
});
