const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ipstalk",
    alias: ["stalkip", "iplookup"],
    react: "🌍",
    desc: "🔍 Stalk any IP address for geolocation & ISP details",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide an IP address!*\nExample: `.ipstalk 41.90.70.195`");

        await safeReact('⏳', mek, conn);

        // Fetch IP details
        const url = `https://api.giftedtech.co.ke/api/stalk/ipstalk?apikey=gifted_api_6kuv56877d&address=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.success || !data?.result) {
            return safeReply(conn, mek.key.remoteJid, "❌ *Unable to fetch IP details. Try again later!*");
        }

        const ip = data.result;
        const ipInfo = `
*🌍 IP Stalker Results*

*📌 IP Address:* ${ip.ip}
*🗺 Country:* ${ip.country} (${ip.countryCode})
*🏙 City:* ${ip.city}, ${ip.region}
*🌐 Continent:* ${ip.continent} (${ip.continentCode})
*📮 Postal:* ${ip.postal}
*🏢 ISP:* ${ip.asName}
*🌎 Domain:* ${ip.asDomain}
*📡 ASN:* ${ip.asn}
*🕓 Timezone:* ${ip.timezone}
*📍 Location:* ${ip.loc}

🔰 *Powered by HANS BYTE V2*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                serverMessageId: 144,
            },
            externalAdReply: {
                title: "🔍 IP Stalker",
                body: "🌍 Trace IP addresses instantly",
                mediaType: 1,
                thumbnailUrl: "https://i.ibb.co/vLQ5Y2s/f4e14ec0-f07c-49bc-b22b-f6c61bf4cf9e.jpg",
                sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
            }
        };

        await safeReply(conn, from, ipInfo, mek, { contextInfo: newsletterContext });

    } catch (e) {
        console.error("IP Stalk Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error fetching IP details:* " + e.message);
    }
});
