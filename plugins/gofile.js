const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "gofile",
    alias: ["gf", "gofiledl"],
    react: "📥",
    desc: "📂 Download files from GoFile",
    category: "📁 Downloads",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide a GoFile URL.*");

        // Call GiftedTech GoFile download API
        const api = `https://api.giftedtech.web.id/api/download/gofile?apikey=gifted&url=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.result || !json.result.children) {
            return reply("🚫 *Failed to get files from GoFile.*");
        }

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
                thumbnailUrl: 'https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg',
                showAdAttribution: true,
                sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
            }
        };

        // Iterate through all files in folder (or single file)
        for (const fileId in json.result.children) {
            const file = json.result.children[fileId];

            // Prepare API info message
            const infoMsg = `
╭━[  *GoFile File Info*  ]━╮
┃ 🔹 *Name:* ${file.name}
┃ 🔹 *Type:* ${file.type || "File"}
┃ 🔹 *Size:* ${Math.round(file.size / 1024 / 1024)} MB
┃ 🔹 *MIME Type:* ${file.mimetype || "Unknown"}
┃ 🔹 *Uploaded On:* ${new Date(file.createTime * 1000).toLocaleString()}
┃ 🔹 *Last Modified:* ${new Date(file.modTime * 1000).toLocaleString()}
┃ 🔹 *Download Count:* ${file.downloadCount || 0}
┃ 🔹 *File ID:* ${file.id}
┃ 🔹 *Server:* ${file.serverSelected || "Unknown"}
┃ 🔹 *GoFile Folder:* ${json.result.name || "N/A"}
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

            // Send the info first
            await conn.sendMessage(
                from,
                { text: infoMsg, contextInfo },
                { quoted: mek }
            );

            // Then send the actual file
            const fileRes = await fetch(file.link);
            const fileBuffer = await fileRes.buffer();

            await conn.sendMessage(
                from,
                {
                    document: fileBuffer,
                    mimetype: file.mimetype || "application/octet-stream",
                    fileName: file.name,
                    caption: "📄 *Here is your GoFile file.*",
                    contextInfo
                },
                { quoted: mek }
            );
        }

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while downloading the GoFile file.*");
    }
});
