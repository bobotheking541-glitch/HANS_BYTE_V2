const { cmd } = require("../command");
const { getBuffer } = require("../lib/functions");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Helper function to get the code point of an emoji
function getCodePoint(emoji) {
  return emoji.codePointAt(0).toString(16);
}

/*
Emoji Kitchen API

About:
Emoji Kitchen is a feature of Gboard which allows you to combine two emojis to make stickers.
This API facilitates you to get the stickers as an image by just providing the two emojis.

Usage:
The API URL is in the format:
  https://emojik.vercel.app/s/:emojis?size=<size>

Where:
  - 16 ≤ size ≤ 512
  - emojis: "<emoji1|codePoint1>_<emoji2|codePoint2>"

Examples: 
  - Using codepoints:
      https://emojik.vercel.app/s/1f979_1f617?size=128
  - Using emojis:
      https://emojik.vercel.app/s/🥹_😗?size=128
*/

cmd({
    pattern: "emix",
    alias: ["emomix", "emojimix"],
    desc: "Combine two emojis into a sticker using Emoji Kitchen API.",
    category: "fun",
    react: "😃",
    use: ".emix 😂,🙂",
    filename: __filename,
}, async (conn, mek, m, { args, q, reply, sender }) => {
    try {
        if (!q.includes(",")) {
            return safeReply(conn, mek.key.remoteJid, "❌ *Usage:* .emix 😂,🙂\n_Send two emojis separated by a comma._");
        }

        let [emoji1, emoji2] = q.split(",").map(e => e.trim());

        if (!emoji1 || !emoji2) {
            return safeReply(conn, mek.key.remoteJid, "❌ Please provide two emojis separated by a comma.");
        }

        // Construct API URL using Emoji Kitchen API
        // We'll use codepoints for the URL.
        let emoji1CP = getCodePoint(emoji1);
        let emoji2CP = getCodePoint(emoji2);
        let apiUrl = `https://emojik.vercel.app/s/${emoji1CP}_${emoji2CP}?size=128`;

        let buffer = await getBuffer(apiUrl);
        if (!buffer) {
            return safeReply(conn, mek.key.remoteJid, "❌ Could not generate emoji mix. Try different emojis.");
        }
        
        let sticker = new Sticker(buffer, {
            pack: "Emoji Mix",
            author: "HANS TECH",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
            background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();

        // Newsletter context info
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                serverMessageId: 143,
            },
        };

        await safeSend(conn, mek.chat, { 
            sticker: stickerBuffer, 
            contextInfo: newsletterContext 
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in .emix command:", e.message);
        safeReply(conn, mek.key.remoteJid, `❌ Could not generate emoji mix: ${e.message}`);
    }
});