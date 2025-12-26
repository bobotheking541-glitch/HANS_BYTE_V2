const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "spoti",
    alias: ["spotify", "spotidl"],
    desc: "🎶 Download or Search Spotify songs in Hans Byte Style ⚡",
    category: "download",
    react: "🎧",
    use: ".spoti <song-name or spotify-url>",
    filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
    try {
        if (!q) {
            return safeReply(conn, mek.key.remoteJid, 
`┌─❖ ⚡ *HANS BYTE V2* ⚡
│
├  🎵 Use:  *.spoti <song-name>*
├  📥 Or:   *.spoti <spotify-url>*
│
└─❖ Example: *.spoti another love*`
            );
        }

        let track;
        let dlData;

        if (q.match(/https?:\/\/open\.spotify\.com\/track\//i)) {
            // Direct URL download
            const dlUrl = `https://api.giftedtech.co.ke/api/download/spotifydl?apikey=gifted_api_6kuv56877d&url=${encodeURIComponent(q)}`;
            const dlRes = await axios.get(dlUrl);
            dlData = dlRes.data;
            if (!dlData.success || !dlData.result?.download_url)
                return safeReply(conn, mek.key.remoteJid, "😵 *Oops!* Couldn't download that Spotify track!");
            track = dlData.result;

        } else {
            // Search first → then download
            const searchUrl = `https://api.giftedtech.co.ke/api/search/spotifysearch?apikey=gifted_api_6kuv56877d&query=${encodeURIComponent(q)}`;
            const searchRes = await axios.get(searchUrl);
            const searchData = searchRes.data;

            if (!searchData.success || !searchData.results?.length)
                return safeReply(conn, mek.key.remoteJid, "😵 *No results!* Try another name.");

            const first = searchData.results[0];

            const dlUrl = `https://api.giftedtech.co.ke/api/download/spotifydl?apikey=gifted_api_6kuv56877d&url=${encodeURIComponent(first.url)}`;
            const dlRes = await axios.get(dlUrl);
            dlData = dlRes.data;

            if (!dlData.success || !dlData.result?.download_url)
                return safeReply(conn, mek.key.remoteJid, "😵 *Download failed!* Try again later.");

            track = dlData.result;
            track.artist = first.artist; // enrich with artist from search
        }

        const { title, duration, thumbnail, download_url } = track;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 145,
            },
        };

        // Show info card
        await safeSend(conn, mek.chat, {
            image: { url: thumbnail },
            caption: 
`┌─❖ 🎶 *TRACK FOUND* 🎶
│
├  🎵 *Title:* ${title}
├  👤 *Artist:* ${track.artist || "Unknown"}
├  ⏱️ *Duration:* ${duration}
│
└─❖ 📥 *Downloading now...*`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Send audio
        await safeSend(conn, mek.chat, {
            audio: { url: download_url },
            mimetype: "audio/mp4",
            fileName: `${title}.mp3`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error("Spotify Error:", e.response?.status, e.response?.data || e.message);
        safeReply(conn, mek.key.remoteJid, "💥 *Yikes!* Something went wrong while processing your request!\nTry again later.");
    }
});
