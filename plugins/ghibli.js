const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "ghibli",
    alias: ["ghib", "ghiblimg"],
    react: "🎨",
    desc: "✨ Generate a Studio Ghibli-style image from text",
    category: "🖼️ Image",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please enter a prompt to generate a Ghibli-style image.*");

        // Ensure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const filePath = path.join(tempDir, `ghibli_${Date.now()}.webp`);

        // Fetch image as buffer
        const api = `https://api.giftedtech.co.ke/api/ai/text2ghibli?apikey=gifted_api_6kuv56877d&prompt=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        if (!res.ok) return safeReply(conn, mek.key.remoteJid, "🚫 *Failed to fetch image from API.*");

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save image
        fs.writeFileSync(filePath, buffer);

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
                thumbnailUrl: filePath, // optional: could generate a JPG thumbnail if needed
                showAdAttribution: true
            }
        };

        const caption = `
╭━[   *GHIBLI IMAGE*   ]━╮
┃ 🔹 *Prompt:* ${q}
┃ 🖌️ *Style:* Studio Ghibli
┃ 🧊 *Status:* Generated successfully!
╰━━━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send the image
        await safeSend(conn, 
            from,
            {
                image: fs.readFileSync(filePath),
                caption,
                contextInfo
            },
            { quoted: mek }
        );

        // Delete temp file
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while generating the Ghibli image.*\nPlease try again later.");
    }
});
