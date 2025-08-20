const { cmd } = require('../command');
const fetch = require('node-fetch');

const APIKEY = "fg_PiJUak5R";

cmd({
    pattern: "scdl",
    alias: ["soundcloud", "soundclouddl", "scdownload"],
    react: "🎵",
    desc: "🎧 Download SoundCloud track audio by URL",
    category: "🎶 Downloader",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide a SoundCloud track URL!*\nExample: `.scdl https://soundcloud.com/artist/track`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://api.fgmods.xyz/api/downloader/soundcloud?url=${encodeURIComponent(q)}&apikey=${APIKEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.status || !data.result) {
            return reply("❌ *Failed to fetch track info. Check the URL and try again.*");
        }

        const track = data.result;
        const caption = `
🎵 *Title:* ${track.title}
⏳ *Duration:* ${track.duration}
🎚️ *Quality:* ${track.quality}

🔗 Download URL below.
🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 152,
            },
            externalAdReply: {
                title: `🎵 SoundCloud Downloader`,
                body: track.title,
                mediaType: 2,
                thumbnailUrl: track.thumb,
                sourceUrl: q
            }
        };

        // Send audio file as document with caption + context
        await conn.sendMessage(from, { 
            document: { url: track.dl_url }, 
            mimetype: 'audio/mpeg', 
            fileName: track.title + '.mp3', 
            caption: caption,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error("SoundCloud Download Error:", e);
        reply("❌ *Error downloading SoundCloud track:* " + e.message);
    }
});

cmd({
    pattern: "facebook",
    alias: ["fb", "fbvideo"],
    react: "📽️",
    desc: "📥 Download Facebook video by URL",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q || !q.includes("facebook.com")) {
            return reply("❌ *Please provide a valid Facebook video URL.*");
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(q)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.success || !data.result?.downloads) {
            return reply("🚫 *Failed to fetch the Facebook video.*");
        }

        const { title, downloads } = data.result;
        const hd = downloads.hd?.url;
        const sd = downloads.sd?.url;
        const videoUrl = hd || sd;

        if (!videoUrl) return reply("❌ *No downloadable link found.*");

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 201,
            },
            externalAdReply: {
                title: "🎬 Facebook Video Downloader",
                body: title,
                mediaType: 2,
                thumbnailUrl: "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg", // placeholder, you can change to dynamic
                showAdAttribution: true,
                sourceUrl: q
            }
        };

        await conn.sendMessage(
            from,
            {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption: `🎞️ *Title:* ${title}\n🎥 *Quality:* ${hd ? "HD" : "SD"}\n✅ *Downloaded by HANS BYTE 2*`,
                contextInfo
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while processing the video.*");
    }
});


cmd({
    pattern: "tikdl",
    alias: ["ttdl", "tiktok"],
    react: "🎵",
    desc: "🎬 Download TikTok video or audio by link",
    category: "📥 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q || !q.includes("tiktok.com")) return reply("❌ *Please enter a valid TikTok link.*");

        const api = `https://apis.davidcyriltech.my.id/download/tiktokv3?url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.video) return reply("🚫 *Failed to fetch TikTok video.*");

        const { author, description, thumbnail, video, audio } = json;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 777,
            },
            externalAdReply: {
                title: `🎵 TikTok Video by @${author}`,
                body: description.length > 80 ? description.slice(0, 80) + "..." : description,
                mediaType: 2,
                thumbnailUrl: thumbnail,
                showAdAttribution: true,
                sourceUrl: q
            }
        };

        const caption = `
╭━━━[ *𝙏𝙄𝙆𝙏𝙊𝙆 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿* ]━━━╮
┃ 👤 *Author:* @${author}
┃ 📝 *Caption:* ${description.split("#")[0].trim()}
┃ 🎧 *Audio:* Included
┃ 🎥 *Video:* Sending...
╰━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send thumbnail + info
        await conn.sendMessage(
            from,
            {
                image: { url: thumbnail },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

        // Send video
        await conn.sendMessage(
            from,
            {
                video: { url: video },
                caption: "✅ *Here’s your TikTok video!*",
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

        // Send audio
        await conn.sendMessage(
            from,
            {
                audio: { url: audio },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *Something went wrong while fetching the TikTok content.*");
    }
});


cmd({
    pattern: "gdrive",
    alias: ["gdl", "gdrivedl"],
    react: "☁️",
    desc: "📁 Download Google Drive files easily",
    category: "📥 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q || !q.includes("drive.google.com")) {
            return reply("❌ *Please provide a valid Google Drive file link.*");
        }

        const api = `https://apis.davidcyriltech.my.id/gdrive?url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.download_link) {
            return reply("🚫 *Failed to fetch the Google Drive file.*");
        }

        const { name, download_link } = json;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 777,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 102,
            },
            externalAdReply: {
                title: "📁 Google Drive File",
                body: name,
                mediaType: 2,
                thumbnailUrl: "https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
                showAdAttribution: true,
                sourceUrl: q
            }
        };

        const caption = `
╭━━━[ *𝐆𝐎𝐎𝐆𝐋𝐄 𝐃𝐑𝐈𝐕𝐄 𝐃𝐋* ]━━━╮
┃ 📦 *File:* ${name}
┃ 🌐 *Source:* Google Drive
┃ 🔗 *Status:* Downloading...
╰━━━━━━━━━━━━━━━━━━━━╯

☁️ *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send preview first
        await conn.sendMessage(
            from,
            {
                image: { url: "https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

        // Send the file
        await conn.sendMessage(
            from,
            {
                document: { url: download_link },
                fileName: name,
                mimetype: "application/octet-stream",
                caption: "✅ *File successfully sent from Google Drive.*",
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while processing the Google Drive link.*");
    }
});


cmd({
    pattern: "xdl",
    alias: ["twitter", "tweetdl", "twdl"],
    react: "🐦",
    desc: "📽️ Download Twitter/X videos by link",
    category: "📥 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q || !q.includes("twitter.com") && !q.includes("x.com")) {
            return reply("❌ *Please provide a valid Twitter/X post link.*");
        }

        const api = `https://apis.davidcyriltech.my.id/twitterV2?url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.result || json.result.length === 0) {
            return reply("🚫 *No video found or download failed.*");
        }

        // Prefer the highest quality available (assuming sorted)
        const best = json.result.find(v => v.quality === "720p") || json.result[0];
        const { url: videoUrl, quality, thumbnail } = best;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 777,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 303
            },
            externalAdReply: {
                title: `📽️ Twitter Video (${quality})`,
                body: "Click to watch or download full quality",
                mediaType: 2,
                thumbnailUrl: thumbnail,
                showAdAttribution: true,
                sourceUrl: q
            }
        };

        const caption = `
╭━━━[ *𝐓𝐖𝐈𝐓𝐓𝐄𝐑 / 𝐗 𝐃𝐋* ]━━━╮
┃ 👤 *Source:* Twitter/X
┃ 🎞️ *Quality:* ${quality}
┃ 🎯 *Status:* Sending video...
╰━━━━━━━━━━━━━━━━━━━━━━╯

🐦 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Preview with thumbnail
        await conn.sendMessage(
            from,
            {
                image: { url: thumbnail },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

        // Send the actual video
        await conn.sendMessage(
            from,
            {
                video: { url: videoUrl },
                caption: "✅ *Twitter video downloaded successfully!*",
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while processing your Twitter video request.*");
    }
});

