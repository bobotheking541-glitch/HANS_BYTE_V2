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
        return reply("🚫 Owner only command!");
      }
    }

    await reply("Shutting down... 📴");
    // give small delay to let message be sent
    setTimeout(() => process.exit(0), 1000);
  } catch (err) {
    console.error('shutdown handler error:', err);
    reply('Error while attempting shutdown.');
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  if (!args[0]) return reply("❌ Please provide a message for broadcast.");

  let text = args.join(" ");
  let chats = Object.keys(conn.chats);

  for (let jid of chats) {
    await conn.sendMessage(jid, { text: `📢 *Broadcast from Owner*\n\n${text}` });
  }

  reply("✅ Broadcast sent!");
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  let statusMsg = args.join(" ") || "🤖 HANS BYTE V2 – Smarter, Faster, Better ⚡";
  await conn.updateProfileStatus(statusMsg);
  reply("✅ About updated!");
});

// 🚪 Leave Group
cmd({
  pattern: 'leave',
  alias: [],
  desc: 'Force the bot to leave the current group (Owner only).',
  react: '🚪',
  use: '.leave',
  category: 'Owner',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply, isGroup, isOwner }) => {
  if (!isOwner) {
    const resolvedIsOwner = isOwnerResolved(sender, OWNERS, maps);
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  if (!isGroup) return reply("❌ This command can only be used in a group.");
  await reply("👋 Leaving group...");
  await conn.groupLeave(from);
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }

  // Safe fetching of groups
  let groups = [];
  if (conn.store && conn.store.chats) {
    groups = Array.from(conn.store.chats.values()).filter(c => c.id.endsWith("@g.us"));
  } else if (conn.chats) {
    groups = Object.values(conn.chats).filter(c => c.id.endsWith("@g.us"));
  }

  if (!groups.length) return reply("❌ No groups found.");

  let txt = "📂 *Groups List:*\n\n";
  groups.forEach((g, i) => {
    txt += `${i + 1}. ${g.name || "Unnamed"}\n${g.id}\n\n`;
  });

  reply(txt);
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  let command = args.join(" ");
  if (!command) return reply("❌ Provide a shell command to run.");
  exec(command, (err, stdout) => {
    if (err) return reply(`❌ Error:\n${err.message}`);
    reply(stdout || "✅ Command executed.");
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  let code = args.join(" ");
  if (!code) return reply("❌ Provide JS code to evaluate.");
  try {
    let result = await eval(code);
    reply(util.format(result));
  } catch (err) {
    reply(`❌ Error:\n${err}`);
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
    if (!resolvedIsOwner) return reply("🚫 Owner only command!");
  }
  await reply('Restarting... 🔁');
  // small delay to allow message delivery
  setTimeout(() => process.exit(1), 1000);
});
