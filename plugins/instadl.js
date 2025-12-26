const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ig",
    alias: ["instagram", "igdl", "insta"],
    react: "📹",
    desc: "Download Instagram reels",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, reply, q, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "*❌ Please provide an Instagram URL!*\nExample: .ig <URL>");

        if (!q.match(/^https?:\/\/(www\.)?instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_-]+/)) {
            return safeReply(conn, mek.key.remoteJid, "*❌ Invalid Instagram URL!*");
        }

        const apiUrl = `https://hanstech-api.zone.id/api/instagram?url=${encodeURIComponent(q)}&key=hans~UfvyXEb`;
        const data = await (await fetch(apiUrl)).json();

        if (data.status !== "success") return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch Instagram post.");

        const media = data.media[0];
        const postInfo = {
            author: data.author || '𝗔𝗻𝗼𝗻𝘆𝗺𝗼𝘂𝘀',
            caption: data.caption || '𝗡𝗼 𝗖𝗮𝗽𝘁𝗶𝗼𝗻',
            timePosted: data.timePosted || '𝗨𝗻𝗸𝗻𝗼𝘄𝗻',
            likesCount: data.likesCount || '0',
            commentsCount: data.commentsCount || '0'
        };

        const desc = `
╔══✦❘༻ *HANS BYTE* ༺❘✦══╗
┇  🌀 *𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥* 🌀
┇╭───────────────────
┇│•🎭 𝗧𝘆𝗽𝗲: ${media.type?.toUpperCase() || '𝗨𝗡𝗞𝗡𝗢𝗪𝗡'} 
┇│•🎯 𝗔𝘂𝘁𝗵𝗼𝗿: ${postInfo.author}
┇│•🌐 𝗟𝗶𝗻𝗸: ${q}
╰─・─・─・─・─・─・─・─╯
╭━✦❘༻ 𝗣𝗢𝗦𝗧 𝗜𝗡𝗙𝗢 ༺❘✦━╮
│•📝 𝗖𝗮𝗽𝘁𝗶𝗼𝗻: ${postInfo.caption.slice(0, 50)}...
│•📅 𝗗𝗮𝘁𝗲: ${postInfo.timePosted}
│•❤️ 𝗟𝗶𝗸𝗲𝘀: ${postInfo.likesCount} 
│•💬 𝗖𝗼𝗺𝗺𝗲𝗻𝘁𝘀: ${postInfo.commentsCount}
╰━✦❘༻ *HANS BYTE* ༺❘✦━╯`;

        if (media.type === "video") {
            await safeSend(conn, from, { video: { url: media.url }, caption: desc }, { quoted: mek });
        } else if (media.type === "image") {
            await safeSend(conn, from, { image: { url: media.url }, caption: desc }, { quoted: mek });
        } else {
            return safeReply(conn, mek.key.remoteJid, "❌ Unsupported media type.");
        }
    } catch (e) {
        console.error("Error fetching Instagram post:", e);
        safeReply(conn, mek.key.remoteJid, "⚠️ Error fetching the Instagram post.");
    }
});
