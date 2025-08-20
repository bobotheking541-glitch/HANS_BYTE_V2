const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "convert",
    alias: ["currency", "currconvert", "curr", "moneyconvert"],
    react: "💱",
    desc: "💵 Convert currency from one unit to another",
    category: "🕵️ Utility",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide amount, from currency and to currency!*\nExample: `.convert 100 USD EUR`");

        const args = q.trim().split(/\s+/);
        if (args.length !== 3) return reply("❌ *Invalid format!*\nExample: `.convert 100 USD EUR`");

        const [amount, fromCurr, toCurr] = args;

        if (isNaN(amount)) return reply("❌ *Amount must be a valid number!*");

        // Validate currencies with API call to currencies list
        const currenciesRes = await fetch("https://apis.davidcyriltech.my.id/tools/currencies");
        const currenciesData = await currenciesRes.json();
        const validCurrencies = currenciesData.currencies.map(c => c.toUpperCase());

        if (!validCurrencies.includes(fromCurr.toUpperCase())) return reply(`❌ *Invalid from currency:* ${fromCurr.toUpperCase()}`);
        if (!validCurrencies.includes(toCurr.toUpperCase())) return reply(`❌ *Invalid to currency:* ${toCurr.toUpperCase()}`);

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/tools/convert?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurr)}&to=${encodeURIComponent(toCurr)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) return reply("❌ *Conversion failed. Please try again later.*");

        const convertMsg = `
*💱 Currency Conversion*

*Amount:* ${amount}
*From:* ${fromCurr.toUpperCase()}
*To:* ${toCurr.toUpperCase()}

*Result:* ${data.result}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 150,
            },
            externalAdReply: {
                title: "💱 Currency Converter",
                body: `${amount} ${fromCurr.toUpperCase()} → ${toCurr.toUpperCase()}`,
                mediaType: 1,
                thumbnailUrl: "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg", // example icon, replace if you want
                sourceUrl: "https://apis.davidcyriltech.my.id/tools/convert"
            }
        };

        await conn.sendMessage(from, { text: convertMsg, contextInfo: newsletterContext }, { quoted: mek });

    } catch (e) {
        console.error("Currency Convert Error:", e);
        reply("❌ *Error converting currency:* " + e.message);
    }
});
