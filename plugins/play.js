const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "mp3",
    alias: ["ytmp3", "song"],
    react: "🎵",
    desc: "🎧 Download MP3 from YouTube URL",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please enter the YouTube video link.*");

        const api = `https://api.giftedtech.co.ke/api/download/dlmp3?apikey=gifted&url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.result?.download_url) 
            return reply("🚫 *Video not found or failed to fetch MP3.*");

        const { title, thumbnail, quality, download_url } = json.result;

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
            externalAdReply: {
                title: `HANS BYTE MD`,
                body: `BY HANS TECH`,
                mediaType: 2,
                thumbnailUrl: thumbnail,
                showAdAttribution: true,
                sourceUrl: download_url
            }
        };

        const caption = `
╭━[    *MP3 Download*   ]━╮
┃ 🎵 *Title:* ${title}
┃ 📦 *Quality:* ${quality}
┃ 🧊 *Status:* Uploading MP3...
╰━━━━━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send preview
        await conn.sendMessage(
            from,
            {
                image: { url: thumbnail },
                caption,
                contextInfo
            },
            { quoted: mek }
        );

        // Send the actual MP3
        await conn.sendMessage(
            from,
            {
                document: { url: download_url },
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`,
                caption: "✅ *MP3 successfully sent!*\n🔧 *PLEASE FOLLOW CHANNEL <3*",
                contextInfo
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while processing your request.*\nPlease try again later.");
    }
});
