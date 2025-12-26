const { cmd } = require("../command");
const { getBuffer } = require("../lib/functions");
const axios = require("axios");

cmd({
    pattern: "fbdl",
    alias: ["facebook", "fbdownload"],
    desc: "Download HD Facebook videos in style 😎",
    category: "download",
    react: "🔥",
    use: ".fbdl <facebook-url>",
    filename: __filename,
}, async (conn, mek, m, { args, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "🤖 *Yo!* Where's the Facebook URL?\n\nExample: .fbdl https://www.facebook.com/...");

        // Validate URL format
        if (!q.match(/https?:\/\/(www\.)?facebook\.com\/.+/i)) {
            return safeReply(conn, mek.key.remoteJid, "🚫 *Oops!* That doesn't look like a Facebook link!\nSend me a proper Facebook video URL!");
        }

        safeReply(conn, mek.key.remoteJid, "⚡ *Processing your request...*\n_Hold tight while I work my magic!_ ✨");

        // API endpoint
        const apiUrl = `https://apis.davidcyriltech.my.id/facebook3?url=${encodeURIComponent(q)}`;

        // Browser-like headers to avoid 500 errors
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        };

        // Fetch video data with browser headers
        const response = await axios.get(apiUrl, { headers });
        const data = response.data;

        if (!data.status || !data.results || !data.results.hdLink) {
            // Detailed error handling
            if (data.message) {
                return safeReply(conn, mek.key.remoteJid, `😵 *Whoops!* API Error: ${data.message}`);
            }
            return safeReply(conn, mek.key.remoteJid, "😵 *Whoops!* Couldn't fetch that video!\nThe video might be private or unavailable.");
        }

        const { title, caption, duration, image, hdLink } = data.results;

        // Newsletter context
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 143,
            },
        };

        // Send downloading status
        await safeSend(conn, mek.chat, {
            text: `📥 *Downloading HD Video...*\n\n` +
                  `⌛ *Duration:* ${duration || "Unknown"}\n` +
                  `🔥 *Powered by HANS BYTE V2*`,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Send HD video directly
        await safeSend(conn, mek.chat, {
            video: { url: hdLink },
            caption: `✅ *Download Complete!*\n\n` +
                     `🎬 *${title || "Facebook Video"}*\n` +
                     `📝 ${caption || "No description"}\n\n` +
                     `⚡ *Enjoy your HD content!*`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        // Enhanced error diagnostics
        console.error("FB Download Error:", e.response?.status, e.response?.data);
        
        let errorMsg = "💥 *Yikes!* Something went wrong!";
        
        if (e.response) {
            if (e.response.status === 500) {
                errorMsg += "\n\n⚠️ *Server Error:* The API is having issues";
            } else if (e.response.data?.message) {
                errorMsg += `\n\n🔧 *API Says:* ${e.response.data.message}`;
            }
        } else if (e.message.includes("timeout")) {
            errorMsg += "\n\n⏱️ *Timeout:* The request took too long";
        }
        
        errorMsg += "\n\nTry again later or use a different link!";
        safeReply(conn, mek.key.remoteJid, errorMsg);
    }
});