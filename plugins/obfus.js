const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "obfs",
    alias: ["obfuscate", "obfuscator"],
    react: "🔒",
    desc: "🔐 Obfuscate JavaScript code",
    category: "🛠️ Tools",
    filename: __filename
}, async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        if (!args || args.length === 0) 
            return safeReply(conn, mek.key.remoteJid, "❌ *Please provide the JavaScript code to obfuscate.*\n\nUsage:\n.obfs <code>\n\nExample:\n.obfs console.log('Hello')");

        const codeToObfuscate = args.join(' ');
        if (!codeToObfuscate) 
            return safeReply(conn, mek.key.remoteJid, "❌ *No JavaScript code provided.*");

        // Call your Hans Tech obfuscation API (no level param)
        const apiUrl = `https://hanstech-api.zone.id/api/js-obfuscate?code=${encodeURIComponent(codeToObfuscate)}&key=hans%7EUfvyXEb`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        // Expected structure: { status:"success", obfuscated: "function ...", ... }
        if (!json || json.status !== 'success' || !json.obfuscated) {
            console.error('Obfuscation API error:', json);
            return safeReply(conn, mek.key.remoteJid, "🚫 *Failed to obfuscate the code. Please try again with valid JavaScript code.*");
        }

        const obfuscatedCode = json.obfuscated;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 202,
            },
        };

        const caption = `
╭━[ *OBFUSCATOR* ]━╮
┃ 🔐 *Service:* Hans Tech
┃ 🔹 *Original Code:* 
┃ ${codeToObfuscate.length > 50 ? codeToObfuscate.slice(0, 47) + "..." : codeToObfuscate}
┃
┃ 🛠️ *Obfuscated Code (file attached):*
╰━━━━━━━━━━━━━━━━━━╯

⚠️ *Use responsibly!*
        `.trim();

        // Convert obfuscated code string into a buffer
        const buffer = Buffer.from(obfuscatedCode, 'utf-8');

        // Send obfuscated code as a document buffer with required filename
        await safeSend(conn, 
            from,
            {
                document: buffer,
                fileName: `hans-byte.js`,
                mimetype: "text/javascript",
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error(error);
        safeReply(conn, mek.key.remoteJid, "⚠️ *An error occurred while obfuscating the code.*");
    }
});
