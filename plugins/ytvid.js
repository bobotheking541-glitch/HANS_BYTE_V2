const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "mp4",
    alias: ["video", "ytmp4"],
    react: "🎥",
    desc: "Download MP4 by video name or YouTube URL",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Provide a video name or YouTube link*");

        let title, author, thumbnail, videoUrl, mp4Url, duration, views, uploadDate;

        if (q.startsWith("http")) {
            // Direct URL → search via yt-search for extra info
            const searchResult = await yts(q);
            const video = searchResult.videos[0];

            title = video.title;
            author = video.author.name;
            thumbnail = video.thumbnail;
            videoUrl = video.url;
            duration = video.timestamp;
            views = video.views;
            uploadDate = video.ago;

            // MP4 via David Cyril API
            const api = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(q)}&apikey=`;
            const res = await fetch(api);
            const r = await res.json();

            if (!r.status || !r.result?.url)
                return reply("🚫 *Failed to fetch MP4*");

            mp4Url = r.result.url;

        } else {
            // Search via yt-search for term
            const searchResult = await yts(q);
            if (!searchResult.videos.length)
                return reply("🚫 *Video not found*");

            const video = searchResult.videos[0];

            title = video.title;
            author = video.author.name;
            thumbnail = video.thumbnail;
            videoUrl = video.url;
            duration = video.timestamp;
            views = video.views;
            uploadDate = video.ago;

            // MP4 via David Cyril API
            const api = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(video.url)}&apikey=`;
            const res = await fetch(api);
            const r = await res.json();

            if (!r.status || !r.result?.url)
                return reply("🚫 *Failed to fetch MP4*");

            mp4Url = r.result.url;
        }

        const caption = `
🎥 *MP4 FOUND*

📌 Title: ${title}
👤 Author: ${author}
⏱ Duration: ${duration}
👁 Views: ${views.toLocaleString()}
📅 Uploaded: ${uploadDate}
🔗 URL: ${videoUrl}
⏬ Download: MP4
`.trim();

        // Send preview
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption
        }, { quoted: mek });

        // Send MP4
        await conn.sendMessage(from, {
            document: { url: mp4Url },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            caption: "✅ *MP4 sent!*"
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply("⚠️ *Internal error*");
    }
});
