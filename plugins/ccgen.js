const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ccgen",
    alias: ["cardgen", "creditcardgen", "ccgenerate", "ccgenerator"],
    react: "💳",
    desc: "💳 Generate fake credit card details (MasterCard, Visa, etc.)",
    category: "🕵️ Utility",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide card type and optional amount!*\nExample: `.ccgen Visa 3`");

        const args = q.trim().split(/\s+/);
        const cardType = args[0];
        const amount = args[1] ? parseInt(args[1]) : 1;

        if (!cardType) return safeReply(conn, mek.key.remoteJid, "❌ *Card type is required!*\nExample: `.ccgen Visa 3`");
        if (isNaN(amount) || amount < 1 || amount > 10) return safeReply(conn, mek.key.remoteJid, "❌ *Amount must be a number between 1 and 10!*");

        // Send typing/react indicator
        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        // Fetch data from API
        const url = `https://apis.davidcyriltech.my.id/tools/ccgen?type=${encodeURIComponent(cardType)}&amount=${amount}`;
        const res = await fetch(url);

        if (!res.ok) return safeReply(conn, mek.key.remoteJid, `❌ API Error: ${res.status} ${res.statusText}`);

        const data = await res.json();

        if (!data.status) return safeReply(conn, mek.key.remoteJid, "❌ *Failed to generate cards. Check card type and try again.*");

        // Build cards text
        let cardsText = `*💳 Generated ${data.total} ${data.card_type} Card(s):*\n\n`;
        data.cards.forEach(card => {
            cardsText += `*Name:* ${card.name}\n*Number:* ${card.number}\n*CVV:* ${card.cvv}\n*Expiry:* ${card.expiry}\n────────────\n`;
        });
        cardsText += "\n🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*";

        // Newsletter context
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 151,
            },
            externalAdReply: {
                title: `💳 ${data.card_type} Card Generator`,
                body: `Generated ${data.total} card(s)`,
                mediaType: 1,
                thumbnailUrl: "https://i.ibb.co/fvLZj1S/credit-card.png",
                sourceUrl: url
            }
        };

        // Send final message
        await safeSend(conn, from, { text: cardsText, contextInfo: newsletterContext }, { quoted: mek });

    } catch (e) {
        console.error("CCGen Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error generating credit cards:* " + e.message);
    }
});
