const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "html",
    alias: ["generatehtml", "htmlgen"],
    react: "🧾",
    desc: "📝 Generate HTML code from prompt",
    category: "🤖 AI",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide a prompt to generate HTML.*");

        const api = `https://itzpire.com/tools/generate-html?prompt=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (json.status !== "success" || !json.result) {
            return reply("🚫 *Failed to generate HTML code. Please try again.*");
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

        const caption = `
╭━[     *HTML Generated*    ]━╮
┃ 🔹 *Prompt:* ${q}
┃ 🧾 *Result:* Generated successfully!
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send caption first
        await conn.sendMessage(
            from,
            { text: caption, contextInfo },
            { quoted: mek }
        );

        // Send the generated HTML as a .html file
        await conn.sendMessage(
            from,
            {
                document: Buffer.from(json.result, 'utf-8'),
                mimetype: "text/html",
                fileName: `generated-${Date.now()}.html`,
                caption: "📄 *Here is your generated HTML file.*",
                contextInfo
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        reply("⚠️ *An error occurred while generating HTML code.*\nPlease try again later.");
    }
});
