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
        console.log("===== CCGEN DEBUG START =====");

        if (!q) {
            console.log("❌ No query provided");
            return safeReply(conn, mek.key.remoteJid, "❌ *Please provide card type and optional amount!*\nExample: `.ccgen Visa 3`");
        }

        console.log("Raw input:", q);

        const args = q.trim().split(/\s+/);
        console.log("Parsed args:", args);

        const rawType = args[0];
        const amount = args[1] ? parseInt(args[1]) : 1;

        console.log("Raw type:", rawType);
        console.log("Parsed amount:", amount);

        if (!rawType) {
            console.log("❌ No card type provided");
            return safeReply(conn, mek.key.remoteJid, "❌ *Card type is required!*");
        }

        if (isNaN(amount) || amount < 1 || amount > 10) {
            console.log("❌ Invalid amount");
            return safeReply(conn, mek.key.remoteJid, "❌ *Amount must be a number between 1 and 10!*");
        }

        // Normalize card type
        function normalizeCardType(input) {
            const map = {
                visa: "Visa",
                mastercard: "MasterCard",
                master: "MasterCard",
                "americanexpress": "American Express",
                amex: "American Express",
                jcb: "JCB"
            };
            const key = input.toLowerCase().replace(/\s+/g, "");
            console.log("Normalized key:", key, "->", map[key] ?? null);
            return map[key] ?? null;
        }

        const cardType = normalizeCardType(rawType);

        if (!cardType) {
            console.log("❌ Invalid card type after normalization");
            return safeReply(
                conn,
                mek.key.remoteJid,
                "❌ *Invalid card type!*\nSupported: Visa, MasterCard, American Express, JCB\nExample: `.ccgen visa 3`"
            );
        }

        console.log("Final card type for API:", cardType);

        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        // Build API URL
        const url = `https://apis.davidcyriltech.my.id/tools/ccgen?type=${encodeURIComponent(cardType)}&amount=${amount}`;
        console.log("Final API URL:", url);

        // Fetch API
        const res = await fetch(url);
        console.log("Raw response status:", res.status, res.statusText);

        const textRes = await res.text();
        console.log("Raw response text:", textRes);

        if (!res.ok) {
            console.log("❌ API returned non-ok status");
            return safeReply(conn, mek.key.remoteJid, `❌ API Error: ${res.status} ${res.statusText}\nResponse: ${textRes}`);
        }

        const data = JSON.parse(textRes);
        console.log("Parsed JSON data:", data);

        if (!data.status) {
            console.log("❌ API returned status false");
            return safeReply(conn, mek.key.remoteJid, `❌ API Message: ${data.message || "Unknown error"}`);
        }

        // Build cards text
        let cardsText = `*💳 Generated ${data.total} ${data.card_type} Card(s):*\n\n`;
        data.cards.forEach(card => {
            cardsText += `*Name:* ${card.name}\n*Number:* ${card.number}\n*CVV:* ${card.cvv}\n*Expiry:* ${card.expiry}\n────────────\n`;
        });
        cardsText += "\n🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*";

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

        await safeSend(conn, from, { text: cardsText, contextInfo: newsletterContext }, { quoted: mek });

        console.log("===== CCGEN DEBUG END =====");

    } catch (e) {
        console.error("CCGEN ERROR:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error generating credit cards:* " + e.message);
    }
});
