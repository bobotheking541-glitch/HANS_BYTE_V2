const { cmd } = require('../command'); // your command helper
const fetch = require('node-fetch');

cmd({
    pattern: "meme",
    alias: ["memes", "randommeme"],
    react: "😂",
    desc: "🤣 Get a random meme from Reddit",
    category: "🕵️ Utility",
    filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
    console.log("[Meme Command] Triggered by:", sender);

    try {
        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        const res = await fetch("https://meme-api.com/gimme");
        if (!res.ok) {
            console.log("[Meme Command] API error:", res.status, res.statusText);
            return safeReply(conn, mek.key.remoteJid, `❌ API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("[Meme Command] API response received:", data.title);

        const memeText = 
`*🤣 ${data.title}*
📌 Subreddit: ${data.subreddit}
👍 Upvotes: ${data.ups}
👤 Author: ${data.author}
🔗 Link ${data.postLink}`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 152,
            },
            externalAdReply: {
                title: `🤣 Meme from r/${data.subreddit}`,
                body: data.title,
                mediaType: 2, // 2 = image
                thumbnailUrl: data.url,
                sourceUrl: data.postLink
            }
        };

        await safeSend(conn, from, { 
            image: { url: data.url }, 
            caption: memeText, 
            contextInfo: newsletterContext 
        }, { quoted: mek });

        console.log("[Meme Command] Meme sent successfully!");

    } catch (e) {
        console.error("[Meme Command] Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error fetching meme:* " + e.message);
    }
});
