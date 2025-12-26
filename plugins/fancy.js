const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "fancy",
    desc: "Generate fancy text",
    category: "text",
    react: "✨",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const sender = m.sender;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
        };

        async function fetchFonts(text) {
            try {
                const response = await axios.get(`https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`);
                return response.data;
            } catch (error) {
                console.error('Axios fetch error:', error.message);
                return null;
            }
        }

        if (args.length === 0) {
            const res = await fetchFonts("HANS BYTE V");
            if (!res || !res.status || !res.result) {
                return safeReply(conn, mek.key.remoteJid, "Failed to fetch font list.", newsletterContext);
            }

            const fontList = res.result
                .map((f, i) => `${i + 1}. ${f.result}`)
                .join("\n");

            return safeReply(conn, mek.key.remoteJid, `*Available Fancy Fonts:*\n\n${fontList}\n\nUsage: .fancy <font_id> <text>`, newsletterContext);
        }

        if (args.length < 2) {
            return safeReply(conn, mek.key.remoteJid, "Usage: .fancy <font_id> <text>", newsletterContext);
        }

        const fontId = parseInt(args[0]);
        if (isNaN(fontId) || fontId < 1) {
            return safeReply(conn, mek.key.remoteJid, "Invalid font ID.", newsletterContext);
        }

        const text = args.slice(1).join(" ");
        const res = await fetchFonts(text);

        if (!res || !res.status || !res.result || fontId > res.result.length) {
            return safeReply(conn, mek.key.remoteJid, "Invalid font ID or failed to fetch fancy text.", newsletterContext);
        }

        const fancyText = res.result[fontId - 1].result || "";
        return safeReply(conn, mek.key.remoteJid, `*Fancy Text:*\n\n${fancyText}`, newsletterContext);

    } catch (e) {
        console.error(e);
        return safeReply(conn, mek.key.remoteJid, `Error: ${e.message || e}`, newsletterContext);
    }
});
