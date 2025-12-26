const { cmd } = require('../command');
const fetch = require('node-fetch');
const config = require('../config');
// 📧 Generate Temp Mail
cmd({
    pattern: "tempmail",
    alias: ["tmpmail", "mailgen"],
    react: "📧",
    desc: "Generate a temporary email",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const res = await fetch(`https://api.giftedtech.co.ke/api/tempmail/generate?apikey=gifted_api_6kuv56877d`);
        const data = await res.json();

        if (!data.success) return safeReply(conn, mek.key.remoteJid, "❌ Failed to generate temp mail.");

        const msg = `
╭━[   *TEMP MAIL*   ]━╮
┃ 📧 *Email:* ${data.result.email}
┃ ⏳ *Expires:* 10 minutes
┃ 🧊 *Status:* Generated successfully!
╰━━━━━━━━━━━━━━━━━━━━╯

⚡ Use: ${config.PREFIX}inbox <email>
`;

        safeReply(conn, mek.key.remoteJid, msg);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error generating temp mail.");
    }
});

// 📬 Check Inbox
cmd({
    pattern: "inbox",
    alias: ["mailinbox", "checkmail"],
    react: "📬",
    desc: "Check inbox of a temporary email",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Provide the email. Example: .inbox test@aminating.com");

        const res = await fetch(`https://api.giftedtech.co.ke/api/tempmail/inbox?apikey=gifted_api_6kuv56877d&email=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (!data.success) return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch inbox.");
        if (!data.result || data.result.length === 0) return safeReply(conn, mek.key.remoteJid, "📭 No emails received yet. Try again later.");

        const mails = data.result.map((mail, i) => 
            `┃ 📩 *${i+1}.* From: ${mail.from}\n┃ 📝 Subject: ${mail.subject}\n┃ 🆔 ID: ${mail.id}`
        ).join("\n┃\n");

        const msg = `
╭━[   *INBOX*   ]━╮
${mails}
┃ 🧊 *Status:* Inbox fetched!
╰━━━━━━━━━━━━━━━━━━━━╯

⚡ Use: ${config.PREFIX}mail <email> <id>
`;

        safeReply(conn, mek.key.remoteJid, msg);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error fetching inbox.");
    }
});

// 📖 Read Message
cmd({
    pattern: "mail",
    alias: ["readmail", "mailmsg"],
    react: "📖",
    desc: "Read a specific email message",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        const [email, id] = q.split(" ");
        if (!email || !id) return safeReply(conn, mek.key.remoteJid, `❌ Usage: ${config.PREFIX}mail <email> <messageID>`);

        const res = await fetch(`https://api.giftedtech.co.ke/api/tempmail/message?apikey=gifted_api_6kuv56877d&email=${encodeURIComponent(email)}&messageid=${id}`);
        const data = await res.json();

        if (!data.success) return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch message.");
        if (!data.result) return safeReply(conn, mek.key.remoteJid, "📭 No such message found.");

        const msg = `
╭━[   *EMAIL MESSAGE*   ]━╮
┃ 📧 *From:* ${data.result.from}
┃ 📝 *Subject:* ${data.result.subject}
┃ 💬 *Message:* ${data.result.body || "N/A"}
┃ 🧊 *Status:* Message fetched!
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        safeReply(conn, mek.key.remoteJid, msg);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error fetching message.");
    }
});
