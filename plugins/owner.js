const { cmd } = require('../command');
const { exec } = require('child_process');
const util = require('util');
const config = require('../config');
const fs = require('fs');
const path = require('path');

const { loadLidMappings, resolveToJid, isOwnerResolved } = require('../lid-utils');

// configure owner list from config (canonical jid)
const OWNERS = [
  (config.OWNER_NUM || '237696900612') + '@s.whatsapp.net'
];

// optionally, load maps once and refresh every X minutes
let maps = loadLidMappings();
// if you want auto-reload, setInterval(() => maps = loadLidMappings(), 1000 * 60 * 5);

cmd({
  pattern: 'shutdown',
  alias: ['stop'],
  desc: 'Shutdown the bot (Owner only).',
  react: '🛑',
  use: '.shutdown',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, isOwner }) => {
  try {
    console.log("Sender (raw):", sender);
    console.log("isOwner flag:", isOwner);

    // fast path: if Baileys already marked them owner, respect it
    if (!isOwner) {
      // resolve using lid mapping files
      const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
      if (!resolvedIsOwner) {
        return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
      }
    }

    await safeReply(conn, mek.key.remoteJid, "Shutting down... 📴");
    // give small delay to let message be sent
    setTimeout(() => process.exit(0), 1000);
  } catch (err) {
    console.error('shutdown handler error:', err);
    safeReply(conn, mek.key.remoteJid, 'Error while attempting shutdown.');
  }
});






// 📢 Broadcast
cmd({
  pattern: 'broadcast',
  alias: ['bc'],
  desc: 'Broadcast a message to all chats (Owner only).',
  react: '📢',
  use: '.bc <text>',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, args, isOwner }) => {
  // same owner resolution as shutdown: prefer passed flag, otherwise resolve
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }
  if (!args[0]) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a message for broadcast.");

  let text = args.join(" ");
  let chats = Object.keys(conn.chats);

  for (let jid of chats) {
    await safeSend(conn, jid, { text: `📢 *Broadcast from Owner*\n\n${text}` });
  }

  safeReply(conn, mek.key.remoteJid, "✅ Broadcast sent!");
});

// 📝 Set About
cmd({
  pattern: 'setabout',
  alias: ['status'],
  desc: 'Update bot About/status (Owner only).',
  react: '💬',
  use: '.setabout <text>',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, args, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }
  let statusMsg = args.join(" ") || "🤖 HANS BYTE V2 – Smarter, Faster, Better ⚡";
  await conn.updateProfileStatus(statusMsg);
  safeReply(conn, mek.key.remoteJid, "✅ About updated!");
});



// 📂 List Groups
cmd({
  pattern: 'groups',
  alias: [],
  desc: 'List all groups the bot is in (Owner only).',
  react: '📂',
  use: '.groups',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }

  // Safe fetching of groups
  let groups = [];
  if (conn.store && conn.store.chats) {
    groups = Array.from(conn.store.chats.values()).filter(c => c.id.endsWith("@g.us"));
  } else if (conn.chats) {
    groups = Object.values(conn.chats).filter(c => c.id.endsWith("@g.us"));
  }

  if (!groups.length) return safeReply(conn, mek.key.remoteJid, "❌ No groups found.");

  let txt = "📂 *Groups List:*\n\n";
  groups.forEach((g, i) => {
    txt += `${i + 1}. ${g.name || "Unnamed"}\n${g.id}\n\n`;
  });

  safeReply(conn, mek.key.remoteJid, txt);
});


// ⚙️ Exec (Shell Command)
cmd({
  pattern: 'exec',
  alias: [],
  desc: 'Run a shell command (Owner only).',
  react: '⚙️',
  use: '.exec <command>',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, args, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }
  let command = args.join(" ");
  if (!command) return safeReply(conn, mek.key.remoteJid, "❌ Provide a shell command to run.");
  exec(command, (err, stdout) => {
    if (err) return safeReply(conn, mek.key.remoteJid, `❌ Error:\n${err.message}`);
    safeReply(conn, mek.key.remoteJid, stdout || "✅ Command executed.");
  });
});

// 📜 Eval (JS Code)
cmd({
  pattern: 'eval',
  alias: [],
  desc: 'Run JavaScript code (Owner only).',
  react: '📜',
  use: '.eval <code>',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, args, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }
  let code = args.join(" ");
  if (!code) return safeReply(conn, mek.key.remoteJid, "❌ Provide JS code to evaluate.");
  try {
    let result = await eval(code);
    safeReply(conn, mek.key.remoteJid, util.format(result));
  } catch (err) {
    safeReply(conn, mek.key.remoteJid, `❌ Error:\n${err}`);
  }
});

// 🔁 Restart (Owner only)
cmd({
  pattern: 'restart',
  alias: [],
  desc: 'Restart the bot (Owner only).',
  react: '🔁',
  use: '.restart',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return safeReply(conn, mek.key.remoteJid, "🚫 Owner only command!");
  }
  await safeReply(conn, mek.key.remoteJid, 'Restarting... 🔁');
  // small delay to allow message delivery
  setTimeout(() => process.exit(1), 1000);
});
