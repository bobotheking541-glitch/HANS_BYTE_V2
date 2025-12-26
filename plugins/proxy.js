const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "proxy",
    alias: ["prox", "getproxy"],
    react: "🛡️",
    desc: "Fetch elite proxies from GiftedTech API",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const res = await fetch('https://api.giftedtech.co.ke/api/tools/proxy?apikey=gifted_api_6kuv56877d');
        const data = await res.json();

        if (!data.success) return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch proxies.");

        // Take top 5 proxies for neat formatting
        const proxies = data.results.slice(0, 5).map((p, i) => 
            `┃ 🔹 *IP:* ${p.ip}:${p.port}\n┃ 🌍 *Country:* ${p.country}\n┃ 🛡️ *Anonymity:* ${p.anonymity}\n┃ 🔗 *HTTPS:* ${p.https}`
        ).join("\n┃\n");

        const message = `
╭━[   *ELITE PROXIES*   ]━╮
${proxies}
┃ 🧊 *Status:* Fetched successfully!
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        safeReply(conn, mek.key.remoteJid, message);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error fetching proxies.");
    }
});
