const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
const TEMP_DIR = "./temp";

function getFileName(url, res) {
    let filename = path.basename(url.split("?")[0]);
    if (!filename || filename.length < 3) filename = "download.html";

    // Check Content-Disposition header
    const dispo = res.headers.get("content-disposition");
    if (dispo && dispo.includes("filename=")) {
        filename = dispo.split("filename=")[1].replace(/["']/g, "");
    }

    return filename;
}

// ─── CURL Command ────────────────────────────────
cmd({
    pattern: "curl",
    alias: ["cget"],
    react: "🌐",
    desc: "Download a file using curl (max 15MB)",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a URL.\nExample: curl https://example.com/file.zip");

        const res = await fetch(q);
        const buffer = await res.buffer();
        const size = buffer.length;

        if (size > MAX_SIZE) return safeReply(conn, mek.key.remoteJid, "⚠️ File too large! Limit is 15MB.");

        const filename = path.join(TEMP_DIR, getFileName(q, res));
        fs.writeFileSync(filename, buffer);

        const msg = `
╭━[   *CURL DOWNLOAD*   ]━╮
┃ 🔹 *URL:* ${q}
┃ 📦 *File:* ${path.basename(filename)}
┃ 📏 *Size:* ${(size / 1024 / 1024).toFixed(2)} MB
┃ 🧊 *Status:* Downloaded successfully
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        await safeSend(conn, m.chat, { document: fs.readFileSync(filename), fileName: path.basename(filename), mimetype: "application/octet-stream" }, { quoted: m });
        fs.unlinkSync(filename); // Auto delete after sending
        safeReply(conn, mek.key.remoteJid, msg);

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error while downloading file.");
    }
});

// ─── WGET Command ────────────────────────────────
cmd({
    pattern: "wget",
    alias: ["wgetdl"],
    react: "⬇️",
    desc: "Download a file using wget (max 15MB)",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a URL.\nExample: wget https://example.com/file.zip");

        const res = await fetch(q);
        const buffer = await res.buffer();
        const size = buffer.length;

        if (size > MAX_SIZE) return safeReply(conn, mek.key.remoteJid, "⚠️ File too large! Limit is 15MB.");

        const filename = path.join(TEMP_DIR, getFileName(q, res));
        fs.writeFileSync(filename, buffer);

        const msg = `
╭━[   *WGET DOWNLOAD*   ]━╮
┃ 🔹 *URL:* ${q}
┃ 📦 *File:* ${path.basename(filename)}
┃ 📏 *Size:* ${(size / 1024 / 1024).toFixed(2)} MB
┃ 🧊 *Status:* Downloaded successfully
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        await safeSend(conn, m.chat, { document: fs.readFileSync(filename), fileName: path.basename(filename), mimetype: "application/octet-stream" }, { quoted: m });
        fs.unlinkSync(filename); // Auto delete after sending
        safeReply(conn, mek.key.remoteJid, msg);

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error while downloading file.");
    }
});
