const fs = require('fs');
const path = require('path');
const { cmd } = require("../command");
const config = require("../config");
const { loadLidMappings, isOwnerResolved } = require('../lid-utils');
cmd({
    pattern: "setprefix",
    use: ".setprefix <newprefix>",
    desc: "Change the bot command prefix (Owner only).",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { sender, reply, args, isOwner }) => {
    // Check owner
    if (!isOwner) {
        const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
        if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Only bot owners can change the prefix!");
    }

    if (!args[0]) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a new prefix.");
    const newPrefix = args[0];

    // Update in memory
    config.PREFIX = newPrefix;

    // Update config.env
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    if (/^PREFIX\s*=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^PREFIX\s*=.*$/m, `PREFIX=${newPrefix}`);
    } else {
        envContent += `\nPREFIX=${newPrefix}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');

    safeReply(conn, mek.key.remoteJid, `✅ Command prefix updated to: ${newPrefix}`);
});
