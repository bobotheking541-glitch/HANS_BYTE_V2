const { cmd } = require('../command');
const fetch = require('node-fetch');
const qs = require('querystring');

cmd({
    pattern: "pastebin",
    alias: ["pb", "pbdl"],
    react: "📋",
    desc: "📥 Download Pastebin content by URL",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please enter the Pastebin URL or paste key.*");

        // Extract paste key if full URL is provided
        let pasteKey = q.match(/(?:pastebin\.com\/)([a-zA-Z0-9]+)/);
        pasteKey = pasteKey ? pasteKey[1] : q;

        // Prepare POST data
        const postData = qs.stringify({
            api_dev_key: "SrvIl32EwpdIbMqNvicqbmhf2ZaOgVL5",
            api_option: "show_paste",
            api_paste_key: pasteKey
        });

        const res = await fetch("https://pastebin.com/api/api_post.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: postData
        });

        const content = await res.text();

        if (!content || content.includes("Bad API request")) {
            return safeReply(conn, mek.key.remoteJid, "🚫 *Failed to fetch Pastebin content. Please check the paste key or URL.*");
        }

        // Send preview first
        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
            externalAdReply: {
                title: `HANS BYTE MD`,
                body: `BY HANS TECH`,
                mediaType: 2,
                showAdAttribution: true,
                sourceUrl: "https://wa.me/YOUR_WA_CHANNEL_NUMBER" // replace with your WA channel
            }
        };

        const preview = `
╭━[   *Pastebin*   ]━╮
┃ 🔹 *Paste Key:* ${pasteKey}
┃ 📝 *Content Preview:* uploading
╰━━━━━━━━━━━━━━━━━━╯
`.trim();

        await safeSend(conn, from, { text: preview, contextInfo }, { quoted: mek });

        // Send full content as text file
        await safeSend(conn, 
            from,
            {
                document: { url: `https://pastebin.com/raw/${pasteKey}` },
                mimetype: "text/plain",
                fileName: `paste_${pasteKey}.txt`,
                caption: "✅ *Pastebin content successfully sent!*",
                contextInfo
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while processing your request.*\nPlease try again later.");
    }
});
