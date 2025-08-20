const { cmd } = require('../command');
const fetch = require('node-fetch');
const { writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

cmd({
    pattern: "ghibli",
    alias: ["ghibliart", "ghibliimg"],
    react: "🌸",
    desc: "🎨 Generate Studio Ghibli-style art from a prompt",
    category: "🖼️ AI",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide a prompt for the Ghibli image.*\n\nExample:\n.ghibli A cute young man");

        const api = `https://api.giftedtech.co.ke/api/ai/text2ghibli?apikey=gifted&prompt=${encodeURIComponent(q)}`;
        const res = await fetch(api);

        // Check if the response is ok
        if (!res.ok) {
            return reply("🚫 *Failed to generate image. Try again later.*");
        }

        // Save image to temp file
        const buffer = await res.buffer();
        const filePath = join(tmpdir(), `ghibli_${Date.now()}.webp`);
        writeFileSync(filePath, buffer);

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 201,
            },
        };

        const caption = `
╭━[ *GHIBLI ART* ]━╮
┃ 🎨 *Prompt:* ${q}
┃ 🖼️ *Status:* Generated
╰━━━━━━━━━━━━━━━━━━╯

🌟 *Powered by HANS BYTE V2*
        `.trim();

        await conn.sendMessage(
            from,
            {
                image: { url: filePath },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while generating the Ghibli image.*");
    }
});
