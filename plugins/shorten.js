const { cmd } = require('../command');
const fetch = require('node-fetch');

const API_KEY = "gifted_api_6kuv56877d";

// ─── TinyURL Command ────────────────────────────────
cmd({
    pattern: "tinyurl",
    alias: ["short", "turl", "shorten"],
    react: "🔗",
    desc: "Shorten a link using TinyURL",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a URL to shorten.\nExample: tinyurl https://example.com");

        const url = encodeURIComponent(q);
        const res = await fetch(`https://api.giftedtech.co.ke/api/tools/tinyurl?apikey=${API_KEY}&url=${url}`);
        const data = await res.json();

        if (!data.success || !data.result) return reply("❌ Failed to shorten URL.");

        const msg = `
╭━[   *TINYURL GENERATED*   ]━╮
┃ 🔹 *Original:* ${q}
┃ 🔗 *Shortened:* ${data.result}
┃ 🧊 *Status:* Success
╰━━━━━━━━━━━━━━━━━━━━╯
`;
        reply(msg);
    } catch (err) {
        console.error(err);
        reply("❌ Error while generating TinyURL.");
    }
});

// ─── CleanURI Command ────────────────────────────────
cmd({
    pattern: "cleanuri",
    alias: ["curl"],
    react: "🧹",
    desc: "Shorten a link using CleanURI",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a URL.\nExample: cleanuri https://example.com");

        const url = encodeURIComponent(q);
        const res = await fetch(`https://api.giftedtech.co.ke/api/tools/cleanuri?apikey=${API_KEY}&url=${url}`);
        const data = await res.json();

        if (!data.success || !data.result) return reply("❌ Failed to shorten URL.");

        const msg = `
╭━[   *CLEANURI GENERATED*   ]━╮
┃ 🔹 *Original:* ${q}
┃ 🔗 *Shortened:* ${data.result}
┃ 🧊 *Status:* Success
╰━━━━━━━━━━━━━━━━━━━━╯
`;
        reply(msg);
    } catch (err) {
        console.error(err);
        reply("❌ Error while generating CleanURI.");
    }
});

// ─── VURL Command ────────────────────────────────
cmd({
    pattern: "vurl",
    alias: ["vshort"],
    react: "🌐",
    desc: "Shorten a link using VURL",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return reply("❌ Please provide a URL.\nExample: vurl https://example.com");

        const url = encodeURIComponent(q);
        const res = await fetch(`https://api.giftedtech.co.ke/api/tools/vurl?apikey=${API_KEY}&url=${url}`);
        const data = await res.json();

        if (!data.success || !data.result) return reply("❌ Failed to shorten URL.");

        const msg = `
╭━[   *VURL GENERATED*   ]━╮
┃ 🔹 *Original:* ${q}
┃ 🔗 *Shortened:* ${data.result}
┃ 🧊 *Status:* Success
╰━━━━━━━━━━━━━━━━━━━━╯
`;
        reply(msg);
    } catch (err) {
        console.error(err);
        reply("❌ Error while generating VURL.");
    }
});

