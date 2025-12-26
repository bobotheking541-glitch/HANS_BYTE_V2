const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "detectai",
    alias: ["aicheck", "textdetect", "detecttext"],
    react: "🤖",
    desc: "🔍 Detect if text is AI-generated or human-written",
    category: "🕵️ Utility",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide some text to analyze!*\nExample: `.detectai Your text here`");

        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/api/detect?text=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) return safeReply(conn, mek.key.remoteJid, `❌ *API Error:* ${data.error}`);

        const aiScore = data.result.ai_score.toFixed(2);
        const humanScore = data.result.human_score.toFixed(2);
        const aiPercent = data.result.ai_percent;
        const humanPercent = data.result.human_percent;

        const resultMsg = `
*🤖 AI Text Detection Result*

*Text analyzed:*
${data.text}

*AI-generated likelihood:* ${aiScore} (${aiPercent})
*Human-written likelihood:* ${humanScore} (${humanPercent})

Use this as a guideline, not absolute certainty.

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 149,
            },
            externalAdReply: {
                title: "🤖 AI Text Detection",
                body: `AI: ${aiPercent} | Human: ${humanPercent}`,
                mediaType: 1,
                showAdAttribution: true,
                thumbnailUrl: "https://files.catbox.moe/kzqia3.jpeg"
            }
        };

        await safeSend(conn, 
            from,
            { text: resultMsg, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("AI Detect Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error detecting text:* " + e.message);
    }
});
