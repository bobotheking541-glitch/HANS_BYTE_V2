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
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide card type and optional amount!*\nExample: `.ccgen MasterCard 3`");

        const args = q.trim().split(/\s+/);
        const cardType = args[0];
        const amount = args[1] ? parseInt(args[1]) : 1;

        if (!cardType) return reply("❌ *Card type is required!*\nExample: `.ccgen MasterCard 3`");
        if (isNaN(amount) || amount < 1 || amount > 10) return reply("❌ *Amount must be a number between 1 and 10!*");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/tools/ccgen?type=${encodeURIComponent(cardType)}&amount=${amount}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.status) return reply("❌ *Failed to generate cards. Check card type and try again.*");

        let cardsText = `*💳 Generated ${data.total} ${data.card_type} Card(s):*\n\n`;
        data.cards.forEach(card => {
            cardsText += 
`*Name:* ${card.name}
*Number:* ${card.number}
*CVV:* ${card.cvv}
*Expiry:* ${card.expiry}
────────────\n`;
        });

        cardsText += "\n🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*";

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 151,
            },
            externalAdReply: {
                title: `💳 ${data.card_type} Card Generator`,
                body: `Generated ${data.total} cards`,
                mediaType: 1,
                thumbnailUrl: "https://i.ibb.co/fvLZj1S/credit-card.png", // example thumbnail, replace if you want
                sourceUrl: "https://apis.davidcyriltech.my.id/tools/ccgen"
            }
        };

        await conn.sendMessage(from, { text: cardsText, contextInfo: newsletterContext }, { quoted: mek });

    } catch (e) {
        console.error("CCGen Error:", e);
        reply("❌ *Error generating credit cards:* " + e.message);
    }
});
