const { cmd } = require("../command");
const axios = require("axios");

const newsletterContext = {
    mentionedJid: [],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363422794491778@newsletter',
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐕2",
        serverMessageId: 143,
    }
};

// ===================== /spotify Command =====================
cmd({
    pattern: "spotify",
    alias: ['spdl', 'spotdl'],
    react: "🎧",
    desc: "Download audio from Spotify",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    if (!q || !q.includes("open.spotify.com")) {
        return reply("*❌ Please provide a valid Spotify track URL*");
    }

    try {
        const messageContext = { ...newsletterContext, mentionedJid: [sender] };

        const api = `https://api.giftedtech.co.ke/api/download/spotifydl?apikey=gifted_api_6kuv56877d&url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const data = await res.json();

        if (!data.success || !data.result?.download_url) {
            return reply("*❌ Failed to get Spotify download link*");
        }

        const { title, duration, thumbnail, download_url } = data.result;

        const infoMsg = `
╔═━「 🎵 𝙎𝙋𝙊𝙏𝙄𝙁𝙔 𝘿𝙇 」━═╗

⫸ 🎧 *Title:* ${title}
⫸ ⏱️ *Duration:* ${duration}
⫸ 📁 *Format:* MP3
⫸ 🔗 *Link:* ${q}

╚═━「 𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 V2 」━═╝
`.trim();

        // Send info card
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: infoMsg,
            contextInfo: messageContext
        }, { quoted: mek });

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: download_url },
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`,
            ptt: false,
            contextInfo: messageContext
        }, { quoted: mek });

        // Send as document
        await conn.sendMessage(from, {
            document: { url: download_url },
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`,
            caption: "*📁 HANS BYTE V2*",
            contextInfo: messageContext
        }, { quoted: mek });

    } catch (err) {
        console.error("Spotify DL Error:", err);
        return reply(`*❌ Error:* ${err.message}`);
    }
});
