const config = require('../config');
const { cmd } = require('../command');
const { isUrl } = require("../lib/functions");
const fs = require('fs');
const path = require('path');

// =============== JID RESOLUTION UTILITIES ===============

/**
 * Load LID mappings from group metadata
 * Returns a Map of lid -> canonical JID
 */
function loadLidMappings(metadata) {
    const map = new Map();
    if (!metadata?.participants) return map;
    
    for (const p of metadata.participants) {
        if (p.lid && p.id) {
            map.set(p.lid.toLowerCase(), p.id.toLowerCase());
        }
    }
    return map;
}

/**
 * Resolve a JID (handles @lid format and standard format)
 * Returns canonical JID in format: 237xxxxxx@s.whatsapp.net
 */
function resolveToJid(jid, lidMap) {
    if (!jid) return null;
    
    const jidStr = String(jid).toLowerCase();
    
    // Check if it's a lid format
    if (jidStr.includes('@lid')) {
        const resolved = lidMap.get(jidStr);
        if (resolved) return resolved;
    }
    
    // Already in standard format
    if (jidStr.includes('@s.whatsapp.net')) {
        return jidStr;
    }
    
    // Extract number and append domain
    const num = jidStr.split('@')[0].replace(/\D/g, '');
    if (num && /^\d{6,15}$/.test(num)) {
        return `${num}@s.whatsapp.net`;
    }
    
    return jidStr;
}

/**
 * Check if a user is an admin in the group
 */
function isUserAdmin(userJid, metadata) {
    if (!metadata?.participants) return false;
    
    const lidMap = loadLidMappings(metadata);
    const resolvedUser = resolveToJid(userJid, lidMap);
    
    return metadata.participants.some(p => {
        const resolvedParticipant = resolveToJid(p.id, lidMap);
        const isAdmin = (p.admin === 'admin' || p.admin === 'superadmin');
        return resolvedParticipant === resolvedUser && isAdmin;
    });
}

/**
 * Check if user is bot owner
 */
function isBotOwner(userJid) {
    const rawOwners = Array.isArray(config?.OWNER_NUM)
        ? config.OWNER_NUM
        : String(config?.OWNER_NUM ?? "237694668970")
            .split(',')
            .map(s => s.trim());
    
    const ownerJids = rawOwners
        .filter(Boolean)
        .map(o => {
            let s = String(o).trim();
            if (!s) return null;
            if (!s.includes('@') && /^\d{6,15}$/.test(s)) {
                s = `${s}@s.whatsapp.net`;
            }
            return s.toLowerCase();
        })
        .filter(Boolean);
    
    const userJidLower = String(userJid || "").toLowerCase();
    return ownerJids.includes(userJidLower);
}

/**
 * Extract display number from JID for mentions
 */
function jidToNumber(jid) {
    if (!jid) return '';
    let base = jid.split('@')[0];
    base = base.split(':')[0];
    return base;
}

// =============== HELPER FUNCTIONS ===============

function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
}

async function doReact(emoji, m, conn) {
    try {
        await conn.sendMessage(m.key.remoteJid, {
            react: { text: emoji, key: m.key },
        });
    } catch (e) {
        console.error("❌ Reaction error:", e);
    }
}

const newsletterContext = {
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363422794491778@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐓𝐄𝐂𝐇",
        serverMessageId: 143,
    },
};

// =============== COMMANDS ===============

cmd({
    pattern: "setname",
    alias: ["upname", "groupname", "gn", "name"],
    use: '.setname <new group name>',
    desc: "Change group subject (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    try {
        if (!isGroup) {
            return reply("❌ This command only works in group chats!");
        }

        const metadata = await conn.groupMetadata(from);
        const lidMap = loadLidMappings(metadata);
        const resolvedSender = resolveToJid(sender, lidMap);

        if (!isUserAdmin(resolvedSender, metadata)) {
            return conn.sendMessage(from, {
                text: "❌ Only *group admins* can update the group name.",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await doReact("✏️", m, conn);

        const newName = args.join(" ").trim();
        if (!newName) {
            return conn.sendMessage(from, {
                text: "❌ Please provide the new group name.\n\n📌 *Example:* `.setname Awesome Tech Group`",
                contextInfo: newsletterContext
            }, { quoted: mek });
        }

        await conn.groupUpdateSubject(from, newName);

        await conn.sendMessage(from, {
            text: `✅ Group name updated successfully to:\n*${newName}*`,
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });

        await doReact("✅", m, conn);

    } catch (error) {
        console.error("UpdateName Error:", error);
        await doReact("❌", m, conn);
        await conn.sendMessage(from, {
            text: "❌ Failed to update group name. Make sure I have admin rights!",
            contextInfo: newsletterContext
        }, { quoted: mek });
    }
});

cmd({
    pattern: "setdesc",
    alias: ["updesc", "groupdesc", "gdesc", "desc"],
    use: '.setdesc <new group description>',
    desc: "Change group description (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    try {
        if (!isGroup) {
            return reply("❌ This command only works in group chats!");
        }

        const metadata = await conn.groupMetadata(from);
        const lidMap = loadLidMappings(metadata);
        const resolvedSender = resolveToJid(sender, lidMap);

        if (!isUserAdmin(resolvedSender, metadata)) {
            return conn.sendMessage(from, {
                text: "❌ Only *group admins* can update the group description.",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await doReact("📝", m, conn);

        const newDesc = args.join(" ").trim();
        if (!newDesc) {
            return conn.sendMessage(from, {
                text: "❌ Please provide the new group description.\n\n📌 *Example:* `.setdesc Welcome to Awesome Tech Group 🚀`",
                contextInfo: { ...newsletterContext, mentionedJid: [sender] },
            }, { quoted: mek });
        }

        await conn.groupUpdateDescription(from, newDesc);

        await conn.sendMessage(from, {
            text: `✅ Group description updated successfully to:\n*${newDesc}*`,
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });

        await doReact("✅", m, conn);

    } catch (error) {
        console.error("UpdateDesc Error:", error);
        await doReact("❌", m, conn);
        await conn.sendMessage(from, {
            text: "❌ Failed to update group description. Make sure I have admin rights!",
            contextInfo: { ...newsletterContext, mentionedJid: [sender] },
        }, { quoted: mek });
    }
});

cmd({
    pattern: "promote",
    use: ".promote @user (or reply)",
    desc: "Promote a member to admin (admins only).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, args }) => {
    if (!isGroup) return reply("❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("⚠️ Only group admins can promote!");

    let targetJid =
        m.mentionedJid?.[0] ||
        (args[0] && `${args[0].replace(/\D/g, "")}@s.whatsapp.net`) ||
        (m.message.extendedTextMessage?.contextInfo?.participant);

    if (!targetJid)
        return reply("🔎 Please mention, pass number, or reply to the user you want to promote!");

    const resolvedTarget = resolveToJid(targetJid, lidMap);

    if (isUserAdmin(resolvedTarget, metadata))
        return reply(`⚠️ @${jidToNumber(targetJid)} is already an admin!`, {}, { mentions: [targetJid] });

    await conn.groupParticipantsUpdate(from, [targetJid], "promote");

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *HANS BYTE V2 – PROMOTE* 🛡️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${jidToNumber(targetJid)}
📌 *Action:* Promoted to Admin
⚡ *By:* @${jidToNumber(sender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await conn.sendMessage(from, { text: out, mentions: [targetJid, sender], contextInfo: newsletterContext }, { quoted: mek });
    await doReact("🔼", m, conn);
});

cmd({
    pattern: "demote",
    use: ".demote @user (or reply)",
    desc: "Demote an admin to member (admins only).",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, reply, args }) => {
    if (!isGroup) return reply("❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("⚠️ Only group admins can demote!");

    let targetJid =
        m.mentionedJid?.[0] ||
        (args[0] && `${args[0].replace(/\D/g, "")}@s.whatsapp.net`) ||
        (m.message.extendedTextMessage?.contextInfo?.participant);

    if (!targetJid)
        return reply("🔎 Please mention, pass number, or reply to the user you want to demote!");

    const resolvedTarget = resolveToJid(targetJid, lidMap);

    if (!isUserAdmin(resolvedTarget, metadata))
        return reply(`⚠️ @${jidToNumber(targetJid)} is not an admin!`, {}, { mentions: [targetJid] });

    await conn.groupParticipantsUpdate(from, [targetJid], "demote");

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
⚔️ *HANS BYTE V2 – DEMOTE* ⚔️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${jidToNumber(targetJid)}
📌 *Action:* Demoted to Member
⚡ *By:* @${jidToNumber(sender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await conn.sendMessage(from, { text: out, mentions: [targetJid, sender], contextInfo: newsletterContext }, { quoted: mek });
    await doReact("🔽", m, conn);
});

cmd({
    pattern: "mute",
    use: ".mute",
    desc: "Mute the group (only admins can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can mute group!");

    await conn.groupSettingUpdate(from, "announcement");
    await doReact("🔇", m, conn);
    reply("✅ Group muted. Only admins can message now.");
});

cmd({
    pattern: "unmute",
    use: ".unmute",
    desc: "Unmute the group (everyone can message).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can unmute group!");

    await conn.groupSettingUpdate(from, "not_announcement");
    await doReact("🔊", m, conn);
    reply("✅ Group unmuted. Everyone can message now.");
});

cmd({
    pattern: "lock",
    use: ".lock",
    desc: "Lock group settings (only admins can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can lock!");

    await conn.groupSettingUpdate(from, "locked");
    await doReact("🔒", m, conn);
    reply("✅ Group settings locked.");
});

cmd({
    pattern: "unlock",
    use: ".unlock",
    desc: "Unlock group settings (members can edit info).",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can unlock!");

    await conn.groupSettingUpdate(from, "unlocked");
    await doReact("🔓", m, conn);
    reply("✅ Group settings unlocked.");
});

cmd({
    pattern: "add",
    use: ".add <number>",
    desc: "Add a member to group.",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can add!");

    const number = args[0];
    if (!number) return reply("❌ Provide a number. Example: `.add 237696xxxxxx`");

    const userJid = `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    await conn.groupParticipantsUpdate(from, [userJid], "add");
    await doReact("➕", m, conn);
    reply(`✅ Added ${number} to the group.`);
});

cmd({
    pattern: "leave",
    use: ".leave",
    desc: "Bot leaves the group (owner/sudo only).",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    const lidMap = new Map();
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isBotOwner(resolvedSender)) {
        await reply("❌ Only Owner/Sudo can use this!");
        return;
    }

    try {
        await doReact("👋", m, conn);
        await conn.sendMessage(from, { text: "👋 Goodbye everyone!" }, { quoted: mek });
        await conn.groupLeave(from);
    } catch (e) {
        console.error(e);
        await reply("❌ Error while leaving the group.");
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
    if (!isGroup) return reply("❌ This command works only in groups!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("⚠️ Only group admins can use this command!");

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

    await conn.sendMessage(from, {
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
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can delete!");

    if (!mek.message?.extendedTextMessage?.contextInfo?.stanzaId)
        return reply("❌ Reply to the message you want to delete.");

    const msgId = mek.message.extendedTextMessage.contextInfo.stanzaId;
    const participant = mek.message.extendedTextMessage.contextInfo.participant;

    await conn.sendMessage(from, { delete: { id: msgId, remoteJid: from, fromMe: false, participant } });
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
    if (!isGroup) return reply("❌ This command works only in groups!");
    const link = await conn.groupInviteCode(from);
    await doReact("🔗", m, conn);
    await conn.sendMessage(from, { text: `🔗 Group Invite Link:\nhttps://chat.whatsapp.com/${link}` }, { quoted: mek });
});

cmd({
    pattern: "revokelink",
    use: ".revokelink",
    desc: "Revoke and regenerate group invite link (admins only).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only group admins can revoke the invite link.");

    await conn.groupRevokeInvite(from);
    const newLink = await conn.groupInviteCode(from);
    await doReact("♻️", m, conn);
    await conn.sendMessage(from, { text: `✅ Invite link revoked. New link:\nhttps://chat.whatsapp.com/${newLink}` }, { quoted: mek });
});

cmd({
    pattern: "admins",
    use: ".admins",
    desc: "Display a list of all group admins.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ Use this only in groups!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const list = admins.map(a => `@${jidToNumber(a)}`).join("\n");
    await conn.sendMessage(from, { text: `👑 Group Admins:\n${list}`, mentions: admins }, { quoted: mek });
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
    if (!isGroup) return reply("❌ This command works only in groups!");
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
        await conn.sendMessage(from, {
            image: { url: pfpUrl },
            caption: `${header}${info}\n${footer}`
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: `${header}${info}\n${footer}` }, { quoted: mek });
    }
});

cmd({
    pattern: "hidetag",
    use: ".hidetag <message>",
    desc: "Mention everyone without showing numbers.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, sender, args, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata))
        return reply("❌ Only admins can use hidetag!");

    const text = args.join(" ").trim() || " ";
    const mentions = metadata.participants.map(p => p.id);
    await conn.sendMessage(from, { text, mentions }, { quoted: mek });
});

cmd({
    pattern: "tagadmins",
    use: ".tagadmins",
    desc: "Ping all admins.",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ Groups only!");
    const metadata = await conn.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const text = admins.map(a => `@${jidToNumber(a)}`).join(" ");
    await conn.sendMessage(from, { text, mentions: admins }, { quoted: mek });
});

cmd({
    pattern: 'setwelcome',
    use: '.setwelcome on/off',
    desc: 'Enable or disable welcome/leave messages.',
    category: 'group',
    filename: __filename
},
async (conn, mek, m, { args, reply, sender, from, isGroup }) => {
    if (!isGroup) return reply("❌ Group only!");
    
    const metadata = await conn.groupMetadata(from);
    const lidMap = loadLidMappings(metadata);
    const resolvedSender = resolveToJid(sender, lidMap);

    if (!isUserAdmin(resolvedSender, metadata) && !isBotOwner(resolvedSender)) {
        return reply('❌ Only group admins can toggle welcome messages.');
    }

    const option = (args[0] || '').toLowerCase();
    if (option !== 'on' && option !== 'off') {
        return reply('⚙️ Use `.setwelcome on` or `.setwelcome off`');
    }

    try {
        const configPath = path.join(__dirname, '../config.json');
        const raw = fs.readFileSync(configPath, 'utf8');
        const updated = raw.replace(
            /"welcome"\s*:\s*"(true|false)"/,
            `"welcome": "${option === 'on'}"`
        );
        fs.writeFileSync(configPath, updated, 'utf8');
        reply(`✅ Welcome messages are now *${option.toUpperCase()}*`);
    } catch (e) {
        console.error('❌ Failed to update config:', e);
        reply('❌ Failed to update welcome setting.');
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
        return reply("⚠️ Only group admins or bot owner can use this command.");

    if (args.length < 2)
        return reply("Usage: .spam <count> <text>");

    let count = parseInt(args[0]);
    if (isNaN(count) || count < 1)
        return reply("⚠️ Please provide a valid number greater than 0.");
    if (count > 10)
        return reply("⚠️ Spam count too high! Max is 10.");

    let text = args.slice(1).join(" ");
    if (!text)
        return reply("⚠️ Please provide a message to spam.");

    for (let i = 0; i < count; i++) {
        await conn.sendMessage(from, { text });
        await new Promise(resolve => setTimeout(resolve, 300));
    }
});