const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");
const config = require("../config");
const fs = require("fs");
const path = require("path");

const newsletterContext = {
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363422794491778@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
    serverMessageId: 143,
  },
};

function jidToNumber(jid) {
  if (!jid) return "";
  return String(jid).split("@")[0].split(":")[0];
}

async function sendText(conn, jid, text, quoted, mentions = []) {
  const msg = {
    text,
    ...(mentions.length ? { contextInfo: { mentionedJid: mentions } } : {}),
  };
  return conn.sendMessage(jid, msg, { quoted });
}

async function safeSend(conn, jid, content, options) {
  try {
    return await conn.sendMessage(jid, content, options);
  } catch (err) {
    console.error("safeSend error:", err);
  }
}

async function safeReply(conn, jid, text, quoted, options) {
  try {
    return await conn.sendMessage(jid, { text }, { quoted, ...options });
  } catch (err) {
    console.error("safeReply error:", err);
  }
}

async function doReact(emoji, msg, conn) {
  try {
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: emoji, key: msg.key }
    });
  } catch (err) {
    console.log("React skipped:", err.message);
  }
}

function checkIsAdmin(sender, groupMetadata) {
  const maps = loadLidMappings(groupMetadata) || loadLidMappings();
  const resolvedSender = String(resolveToJid(sender, maps) || sender || "").toLowerCase();

  const isAdmin = groupMetadata?.participants?.some((p) => {
    const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
    return pid === resolvedSender && (p.admin === "admin" || p.admin === "superadmin");
  });

  return { isAdmin, maps, resolvedSender };
}

// Fixed isUserAdmin function with proper LID resolution
function isUserAdmin(userJid, groupMetadata) {
  const maps = loadLidMappings(groupMetadata);
  const resolvedUser = String(resolveToJid(userJid, maps) || userJid).toLowerCase();
  
  return groupMetadata.participants.some(p => {
    const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
    return pid === resolvedUser && (p.admin === "admin" || p.admin === "superadmin");
  });
}

function isBotOwner(jid) {
  const ownerNumbers = config.OWNER_NUM.split(",").map(n => n.trim());
  const userNumber = jidToNumber(jid);
  return ownerNumbers.includes(userNumber);
}

// ------------------ demote ------------------
cmd({
  pattern: "demote",
  use: ".demote @user (or reply)",
  desc: "Demote an admin to member (admins only).",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, args, groupMetadata }) => {
  if (!isGroup) return conn.sendMessage(from, { text: "❌ Only works in groups!" }, { quoted: mek });

  const { isAdmin, maps, resolvedSender } = checkIsAdmin(sender, groupMetadata);
  if (!isAdmin) return sendText(conn, from, "⚠️ Only group admins can demote!", mek, [sender]);

  const rawTarget = m.mentionedJid?.[0] || (args[0] ? args[0].replace(/\D/g,"") : "") || m.message?.extendedTextMessage?.contextInfo?.participant;
  if (!rawTarget) return sendText(conn, from, "🔎 Mention or reply to the user you want to demote!", mek);

  const resolvedTarget = String(resolveToJid(rawTarget, maps) || rawTarget).toLowerCase();

  const isTargetAdmin = groupMetadata.participants.some(p => {
    const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
    return pid === resolvedTarget && (p.admin === "admin" || p.admin === "superadmin");
  });

  if (!isTargetAdmin) return sendText(conn, from, `⚠️ @${jidToNumber(resolvedTarget)} is not an admin!`, mek, [resolvedTarget]);

  try {
    await conn.groupParticipantsUpdate(from, [resolvedTarget], "demote");

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
⚔️ *HANS BYTE V2 – DEMOTE* ⚔️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${jidToNumber(resolvedTarget)}
📌 *Action:* Demoted to Member
⚡ *By:* @${jidToNumber(resolvedSender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await sendText(conn, from, out, mek, [resolvedTarget, resolvedSender]);

  } catch (err) {
    console.error("demote error:", err);
    await sendText(conn, from, "❌ Failed to demote. Make sure I have permission to demote members.", mek);
  }
});

cmd({
    pattern: "mute",
    use: ".mute",
    desc: "Mute the group (only admins can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can mute group!");

    await conn.groupSettingUpdate(from, "announcement");
    await doReact("🔇", m, conn);
    safeReply(conn, mek.key.remoteJid, "✅ Group muted. Only admins can message now.");
});

cmd({
    pattern: "unmute",
    use: ".unmute",
    desc: "Unmute the group (everyone can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can unmute group!");

    await conn.groupSettingUpdate(from, "not_announcement");
    await doReact("🔊", m, conn);
    safeReply(conn, mek.key.remoteJid, "✅ Group unmuted. Everyone can message now.");
});

cmd({
    pattern: "lock",
    use: ".lock",
    desc: "Lock group settings (only admins can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can lock!");

    await conn.groupSettingUpdate(from, "locked");
    await doReact("🔒", m, conn);
    safeReply(conn, mek.key.remoteJid, "✅ Group settings locked.");
});

cmd({
    pattern: "unlock",
    use: ".unlock",
    desc: "Unlock group settings (members can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can unlock!");

    await conn.groupSettingUpdate(from, "unlocked");
    await doReact("🔓", m, conn);
    safeReply(conn, mek.key.remoteJid, "✅ Group settings unlocked.");
});

cmd({
    pattern: "add",
    use: ".add <number>",
    desc: "Add a member to group.",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can add!");

    const number = args[0];
    if (!number) return safeReply(conn, mek.key.remoteJid, "❌ Provide a number. Example: `.add 237696xxxxxx`");

    const userJid = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await conn.groupParticipantsUpdate(from, [userJid], "add");
    await doReact("➕", m, conn);
    safeReply(conn, mek.key.remoteJid, `✅ Added ${number} to the group.`);
});

cmd({
    pattern: "leave",
    use: ".leave",
    desc: "Bot leaves the group (owner/sudo only).",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, isGroup }) => {
    // Load lid mappings from group metadata if in a group
    let lidMap = new Map();
    if (isGroup) {
        const metadata = await conn.groupMetadata(from);
        lidMap = loadLidMappings(metadata);
    }
    
    const resolvedSender = resolveToJid(sender, lidMap);

    // Debug logging
    console.log("== LEAVE CMD DEBUG ==");
    console.log("Sender:", sender);
    console.log("Resolved Sender:", resolvedSender);
    console.log("Is Bot Owner:", isBotOwner(resolvedSender));
    console.log("Config Owner:", config.OWNER_NUM);

    if (!isBotOwner(resolvedSender)) {
        await safeReply(conn, mek.key.remoteJid, "❌ Only Owner/Sudo can use this!");
        return;
    }

    try {
        await doReact("👋", m, conn);
        await safeSend(conn, from, { text: "👋 Goodbye everyone!" }, { quoted: mek });
        await conn.groupLeave(from);
    } catch (e) {
        console.error(e);
        await safeReply(conn, mek.key.remoteJid, "❌ Error while leaving the group.");
    }
});

cmd({
    pattern: "tagall",
    use: ".tagall <msg>",
    desc: "Mention everyone in the group with a cool HANS BYTE V2 style.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "⚠️ Only group admins can use this command!");

    const text = args.join(" ") || "✨ Hey fam! Let's gather up ✨";
    const mentions = metadata.participants.map(p => p.id);

    const hansTag = `
━━━━━━━━━━━━━━━━━━━━━━━
🌐 *HANS BYTE V2 BROADCAST* 🌐
━━━━━━━━━━━━━━━━━━━━━━━

${text}

👥 *Group:* ${metadata.subject}
📣 *Tagged Members:* ${mentions.length}

${mentions.map(u => `⚡ @${jidToNumber(u)}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
`;

    await safeSend(conn, from, {
        text: hansTag,
        mentions,
    }, { quoted: mek });

    await doReact("📣", m, conn);
});

cmd({
    pattern: "del",
    use: ".del",
    desc: "Delete a quoted message.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can delete!");

    if (!mek.message?.extendedTextMessage?.contextInfo?.stanzaId)
        return safeReply(conn, mek.key.remoteJid, "❌ Reply to the message you want to delete.");

    const msgId = mek.message.extendedTextMessage.contextInfo.stanzaId;
    const participant = mek.message.extendedTextMessage.contextInfo.participant;

    await safeSend(conn, from, { delete: { id: msgId, remoteJid: from, fromMe: false, participant } });
    await doReact("🗑️", m, conn);
});

cmd({
    pattern: "getlink",
    alias: ["link", "gclink", "grouplink"],
    use: ".getlink",
    desc: "Retrieve the current group invite link.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
    const link = await conn.groupInviteCode(from);
    await doReact("🔗", m, conn);
    await safeSend(conn, from, { text: `🔗 Group Invite Link:\nhttps://chat.whatsapp.com/${link}` }, { quoted: mek });
});

cmd({
    pattern: "revokelink",
    use: ".revokelink",
    desc: "Revoke and regenerate group invite link (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Groups only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only group admins can revoke the invite link.");

    await conn.groupRevokeInvite(from);
    const newLink = await conn.groupInviteCode(from);
    await doReact("♻️", m, conn);
    await safeSend(conn, from, { text: `✅ Invite link revoked. New link:\nhttps://chat.whatsapp.com/${newLink}` }, { quoted: mek });
});

cmd({
    pattern: "admins",
    use: ".admins",
    desc: "Display a list of all group admins.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Use this only in groups!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const list = admins.map(a => `@${jidToNumber(a)}`).join("\n");
    await safeSend(conn, from, { text: `👑 Group Admins:\n${list}`, mentions: admins }, { quoted: mek });
});

cmd({
    pattern: "ginfo",
    alias: ["groupinfo"],
    use: ".ginfo",
    desc: "Show detailed group information with profile pic.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
    const metadata = await conn.groupMetadata(from);
    const total = metadata.participants.length;
    const adminCount = metadata.participants.filter(p => p.admin).length;
    const desc = metadata.desc || "No description set.";

    let pfpUrl;
    try {
        pfpUrl = await conn.profilePictureUrl(from, 'image');
    } catch {
        pfpUrl = null;
    }

    const header = `╔═〘 *${metadata.subject}* 〙═╗`;
    const footer = `╚═══ Powered by 🔥 HANS BYTE V2 ═══╝`;
    const info = `
⦿ *ID:* ${from}
⦿ *Members:* ${total}
⦿ *Admins:* ${adminCount}
⦿ *Description:* ${desc}`;

    if (pfpUrl) {
        await safeSend(conn, from, {
            image: { url: pfpUrl },
            caption: `${header}${info}\n${footer}`
        }, { quoted: mek });
    } else {
        await safeSend(conn, from, { text: `${header}${info}\n${footer}` }, { quoted: mek });
    }
});

cmd({
    pattern: "hidetag",
    use: ".hidetag <message>",
    desc: "Mention everyone without showing numbers.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Groups only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return safeReply(conn, mek.key.remoteJid, "❌ Only admins can use hidetag!");

    const text = args.join(" ").trim() || " ";
    const mentions = metadata.participants.map(p => p.id);
    await safeSend(conn, from, { text, mentions }, { quoted: mek });
});

cmd({
    pattern: "tagadmins",
    use: ".tagadmins",
    desc: "Ping all admins.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Groups only!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const text = admins.map(a => `@${jidToNumber(a)}`).join(" ");
    await safeSend(conn, from, { text, mentions: admins }, { quoted: mek });
});

cmd({
    pattern: 'setwelcome',
    use: '.setwelcome on/off',
    desc: 'Enable or disable welcome/leave messages.',
    category: 'group',
    filename: __filename
}, 
async (conn, mek, m, { args, sender, from, isGroup }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ Group only!");

    const option = (args[0] || '').toLowerCase();
    if (option !== 'on' && option !== 'off') {
        return safeReply(conn, mek.key.remoteJid, '⚙️ Use `.setwelcome on` or `.setwelcome off`');
    }

    // Update in-memory config for runtime
    config.WELCOME = option === 'on' ? 'true' : 'false';

    // Update config.env for persistence
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    if (/^WELCOME\s*=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^WELCOME\s*=.*$/m, `WELCOME=${config.WELCOME}`);
    } else {
        envContent += `\nWELCOME=${config.WELCOME}`;
    }

    try {
        fs.writeFileSync(envPath, envContent, 'utf8');
        safeReply(conn, mek.key.remoteJid, `✅ Welcome messages are now *${option.toUpperCase()}*`);
    } catch (e) {
        console.error('❌ Failed to update config.env:', e);
        safeReply(conn, mek.key.remoteJid, '❌ Failed to update welcome setting.');
    }
});

cmd({
    pattern: "spam",
    react: "⚠️",
    desc: "Spam a message multiple times with warnings",
    category: "group",
    use: ".spam <count> <text>",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, reply, isGroup }) => {
    const lidMap = isGroup ? loadLidMappings(await conn.groupMetadata(from)) : new Map();
    const resolvedSender = resolveToJid(sender, lidMap);

    const isOwner = isBotOwner(resolvedSender);
    const isAdmin = isGroup ? isUserAdmin(resolvedSender, await conn.groupMetadata(from)) : false;

    if (!isOwner && !isAdmin)
        return safeReply(conn, mek.key.remoteJid, "⚠️ Only group admins or bot owner can use this command.");

    if (args.length < 2)
        return safeReply(conn, mek.key.remoteJid, "Usage: .spam <count> <text>");

    let count = parseInt(args[0]);
    if (isNaN(count) || count < 1)
        return safeReply(conn, mek.key.remoteJid, "⚠️ Please provide a valid number greater than 0.");
    if (count > 10)
        return safeReply(conn, mek.key.remoteJid, "⚠️ Spam count too high! Max is 10.");

    let text = args.slice(1).join(" ");
    if (!text)
        return safeReply(conn, mek.key.remoteJid, "⚠️ Please provide a message to spam.");

    for (let i = 0; i < count; i++) {
        await safeSend(conn, from, { text });
        await new Promise(resolve => setTimeout(resolve, 300));
    }
});

cmd({
  pattern: "kick",
  use: ".kick @user (or reply)",
  desc: "Remove a member from the group (admins only).",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, args }) => {
  if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
  
  const metadata = await conn.groupMetadata(from);
  const lidMap = loadLidMappings(metadata);
  const resolvedSender = resolveToJid(sender, lidMap);

  if (!isUserAdmin(resolvedSender, metadata))
      return safeReply(conn, mek.key.remoteJid, "⚠️ Only group admins can kick!");

  let targetJid =
      m.mentionedJid?.[0] ||
      (args[0] && `${args[0].replace(/\D/g, "")}@s.whatsapp.net`) ||
      (m.message.extendedTextMessage?.contextInfo?.participant);

  if (!targetJid)
      return safeReply(conn, mek.key.remoteJid, "🔎 Please mention, pass number, or reply to the user you want to kick!");

  const resolvedTarget = resolveToJid(targetJid, lidMap);

  if (isUserAdmin(resolvedTarget, metadata))
      return safeReply(conn, mek.key.remoteJid, `⚠️ @${jidToNumber(targetJid)} is an admin and cannot be kicked!`, {}, { mentions: [targetJid] });

  await conn.groupParticipantsUpdate(from, [targetJid], "remove");

  const out = `
━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *HANS BYTE V2 – KICK* 🛡️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${jidToNumber(targetJid)}
📌 *Action:* Removed from group
⚡ *By:* @${jidToNumber(sender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
  `;
  await safeSend(conn, from, { text: out, mentions: [targetJid, sender], contextInfo: newsletterContext }, { quoted: mek });
  await doReact("👢", m, conn);
});

cmd({
    pattern: "kickall",
    use: ".kickall",
    desc: "Remove all non-admin members from the group (admins only). Type .stop within 10s to cancel.",
    category: "group",
    filename: __filename
  }, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);
    
    if (!isUserAdmin(resolvedSender, metadata))
      return safeReply(conn, mek.key.remoteJid, "⚠️ Only group admins can use kickall!");
    
    // Get all non-admin participants
    const nonAdmins = metadata.participants
      .filter(p => !isUserAdmin(p.id, metadata))
      .map(p => p.id);
    
    if (nonAdmins.length === 0)
      return safeReply(conn, mek.key.remoteJid, "ℹ️ No non-admin members to kick!");
    
    // Send warning message
    const warningMsg = `
  ━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️ *KICKALL INITIATED* ⚠️
  ━━━━━━━━━━━━━━━━━━━━━━━
  👥 *Target:* ${nonAdmins.length} non-admin members
  ⏱️ *Countdown:* 10 seconds
  🛑 *Cancel:* Type .stop to cancel
  ━━━━━━━━━━━━━━━━━━━━━━━
  `;
    
    await safeSend(conn, from, { text: warningMsg }, { quoted: mek });
    
    // Safe react with error handling
    try {
      await doReact("⏳", m, conn);
    } catch (err) {
      console.log("Reaction skipped due to rate limit");
    }
    
    // Set cancellation flag
    global.kickallCancelled = global.kickallCancelled || {};
    global.kickallCancelled[from] = false;
    
    // Wait 10 seconds with countdown
    for (let i = 10; i > 0; i--) {
      if (global.kickallCancelled[from]) {
        await safeReply(conn, mek.key.remoteJid, "✅ Kickall operation cancelled!");
        try {
          await doReact("✅", m, conn);
        } catch (err) {
          console.log("Reaction skipped");
        }
        delete global.kickallCancelled[from];
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Check one final time before executing
    if (global.kickallCancelled[from]) {
      await safeReply(conn, mek.key.remoteJid, "✅ Kickall operation cancelled!");
      try {
        await doReact("✅", m, conn);
      } catch (err) {
        console.log("Reaction skipped");
      }
      delete global.kickallCancelled[from];
      return;
    }
    
    // Execute kickall
    delete global.kickallCancelled[from];
    
    await safeReply(conn, mek.key.remoteJid, "🔥 Executing kickall...");
    
    let kicked = 0;
    let failed = 0;
    
    // Kick one by one with longer delays to avoid rate limits
    for (let i = 0; i < nonAdmins.length; i++) {
      try {
        await conn.groupParticipantsUpdate(from, [nonAdmins[i]], "remove");
        kicked++;
        
        // Progress update every 5 kicks
        if ((i + 1) % 5 === 0) {
          await safeReply(conn, mek.key.remoteJid, `⏳ Progress: ${i + 1}/${nonAdmins.length} processed...`);
        }
        
        // Wait 2-3 seconds between kicks to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (err) {
        failed++;
        console.error(`Failed to kick ${nonAdmins[i]}:`, err.message);
        
        // If rate limit hit, wait longer
        if (err.data === 429 || err.message?.includes('rate')) {
          await safeReply(conn, mek.key.remoteJid, "⚠️ Rate limit hit, waiting 10 seconds...");
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }
    
    const resultMsg = `
  ━━━━━━━━━━━━━━━━━━━━━━━
  🛡️ *HANS BYTE V2 – KICKALL* 🛡️
  ━━━━━━━━━━━━━━━━━━━━━━━
  ✅ *Kicked:* ${kicked} members
  ❌ *Failed:* ${failed} members
  ⚡ *By:* @${jidToNumber(sender)}
  ━━━━━━━━━━━━━━━━━━━━━━━
  🔥 Powered by HANS BYTE V2
  ━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    await safeSend(conn, from, { 
      text: resultMsg, 
      mentions: [sender], 
      contextInfo: newsletterContext 
    }, { quoted: mek });
    
    try {
      await doReact("👢", m, conn);
    } catch (err) {
      console.log("Final reaction skipped");
    }
  });
  
  // Stop command to cancel kickall
  cmd({
    pattern: "stop",
    use: ".stop",
    desc: "Cancel an ongoing kickall operation.",
    category: "group",
    filename: __filename
  }, async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return safeReply(conn, mek.key.remoteJid, "❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);
    
    if (!isUserAdmin(resolvedSender, metadata))
      return safeReply(conn, mek.key.remoteJid, "⚠️ Only group admins can cancel kickall!");
    
    if (!global.kickallCancelled || !global.kickallCancelled[from]) {
      return safeReply(conn, mek.key.remoteJid, "ℹ️ No active kickall operation to cancel!");
    }
    
    global.kickallCancelled[from] = true;
    try {
      await doReact("🛑", m, conn);
    } catch (err) {
      console.log("Stop reaction skipped");
    }
  });