const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "apk",
    alias: ["app", "apkdl"],
    react: "📲",
    desc: "📥 Download APK by name",
    category: "📁 Download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please enter the app name to search and download.*");

        const api = `https://api.giftedtech.co.ke/api/download/apkdl?apikey=gifted_api_6kuv56877d&appName=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json.success || !json.result?.download_url) return safeReply(conn, mek.key.remoteJid, "🚫 *App not found or failed to fetch APK.*");

        const { appname, appicon, developer, mimetype, download_url } = json.result;

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 200,
            },
            externalAdReply: {
                title: `HANS BYTE MD`,
                body: `BY HANS TECH`,
                mediaType: 2,
                thumbnailUrl: appicon,
                showAdAttribution: true,
                sourceUrl: download_url
            }
        };

        const caption = `
╭━[     *APK*    ]━╮
┃ 🔹 *App Name:* ${appname}
┃ 🔸 *Developer:* ${developer}
┃ 🧊 *Status:* Uploading APK...
╰━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send preview with icon
        await safeSend(conn, 
            from,
            {
                image: { url: appicon },
                caption,
                contextInfo
            },
            { quoted: mek }
        );

        // Send the actual APK
        await safeSend(conn, 
            from,
            {
                document: { url: download_url },
                mimetype: mimetype,
                fileName: `${appname}.apk`,
                caption: "✅ *APK successfully sent!*\n🔧 *Use at your own risk.*",
                contextInfo
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while processing your request.*\nPlease try again later.");
    }
});
