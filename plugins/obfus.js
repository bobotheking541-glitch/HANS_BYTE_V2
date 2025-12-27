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
            return safeReply(
                conn,
                mek.key.remoteJid,
                "❌ *Provide JS code to obfuscate*\n\nUsage:\n.obfs <low|high> <code>"
            );

        // detect level (default: low)
        let level = "low";
        if (["low", "high"].includes(args[0].toLowerCase())) {
            level = args.shift().toLowerCase();
        }

        const codeToObfuscate = args.join(" ");
        if (!codeToObfuscate)
            return safeReply(conn, mek.key.remoteJid, "❌ *No JavaScript code provided.*");

        let obfuscatedCode = null;

        /* ───────── PRIMARY API (Hans Tech) ───────── */
        try {
            const hansApi = `https://hanstech-api.zone.id/api/js-obfuscate?code=${encodeURIComponent(codeToObfuscate)}&key=hans%7EUfvyXEb`;
            const res = await fetch(hansApi);
            const json = await res.json();

            if (json?.status === "success" && json?.obfuscated) {
                obfuscatedCode = json.obfuscated;
            }
        } catch (e) {
            console.error("Hans API failed:", e.message);
        }

        /* ───────── FALLBACK API (David Cyril) ───────── */
        if (!obfuscatedCode) {
            const fallbackApi =
                `https://apis.davidcyriltech.my.id/obfuscate?code=${encodeURIComponent(codeToObfuscate)}&level=${level}`;

            const res = await fetch(fallbackApi);
            const json = await res.json();

            if (!json?.success || !json?.result?.obfuscated_code?.code) {
                return safeReply(
                    conn,
                    mek.key.remoteJid,
                    "🚫 *Both obfuscation services failed.* Try again later 🥲"
                );
            }

            obfuscatedCode = json.result.obfuscated_code.code;
        }

        /* ───────── NEWSLETTER CONTEXT ───────── */
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
╭━[ *JS OBFUSCATED* ]━╮
┃ 🔐 *Level:* ${level.toUpperCase()}
┃ 🛠️ *Service:* Auto‑Fallback
┃ 📦 *File:* hans-byte.js
╰━━━━━━━━━━━━━━━━━━╯

⚠️ Use responsibly 😇
        `.trim();

        const buffer = Buffer.from(obfuscatedCode, "utf-8");

        await safeSend(
            conn,
            from,
            {
                document: buffer,
                fileName: "hans-byte.js",
                mimetype: "text/javascript",
                caption,
                contextInfo: newsletterContext,
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *Unexpected error occurred.*");
    }
});
