const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "countryinfo",
    alias: ["cinfo", "country", "cinfo2"],
    desc: "Get information about a country",
    category: "info",
    react: "🌍",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "Please provide a country name.\nExample: `.countryinfo Pakistan`");

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await safeSend(conn, from, { react: { text: "❌", key: m.key } });
            return safeReply(conn, mek.key.remoteJid, `No information found for *${q}*. Please check the country name.`);
        }

        const info = data.data;
        let neighborsText = info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
            : "No neighboring countries found.";

        const text = `🌍 *Country Information: ${info.name}* 🌍\n\n` +
                     `🏛 *Capital:* ${info.capital}\n` +
                     `📍 *Continent:* ${info.continent.name} ${info.continent.emoji}\n` +
                     `📞 *Phone Code:* ${info.phoneCode}\n` +
                     `📏 *Area:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)\n` +
                     `🚗 *Driving Side:* ${info.drivingSide}\n` +
                     `💱 *Currency:* ${info.currency}\n` +
                     `🔤 *Languages:* ${info.languages.native.join(", ")}\n` +
                     `🌟 *Famous For:* ${info.famousFor}\n` +
                     `🌍 *ISO Codes:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}\n` +
                     `🌎 *Internet TLD:* ${info.internetTLD}\n\n` +
                     `🔗 *Neighbors:* ${neighborsText}`;

        // Newsletter-style context (won’t display as real forwarded unless WhatsApp allows)
        const newsletterContext = {
            mentionedJid: [m.sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
                serverMessageId: 143,
            }
        };

        await safeSend(conn, from, {
            image: { url: info.flag },
            caption: text,
            contextInfo: newsletterContext
        }, { quoted: mek });

        await safeSend(conn, from, { react: { text: "✅", key: m.key } });


    } catch (e) {
        console.error("Error in countryinfo command:", e);
        await react("❌");
        safeReply(conn, mek.key.remoteJid, "An error occurred while fetching country information.");
    }
});