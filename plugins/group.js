const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

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

function checkIsAdmin(sender, groupMetadata) {
  const maps = loadLidMappings(groupMetadata) || loadLidMappings();
  const resolvedSender = String(resolveToJid(sender, maps) || sender || "").toLowerCase();

  const isAdmin = groupMetadata?.participants?.some((p) => {
    const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
    return pid === resolvedSender && (p.admin === "admin" || p.admin === "superadmin");
  });

  return { isAdmin, maps, resolvedSender };
}

function isUserAdmin(userJid, groupMetadata) {
  return groupMetadata.participants.some(p => {
    return p.id === userJid && (p.admin === "admin" || p.admin === "superadmin");
  });
}

// ------------------ setname ------------------
cmd({
  pattern: "setname",
  alias: ["upname","groupname","gn","name"],
  use: ".setname <new group name>",
  desc: "Change group subject (admins only).",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, args, groupMetadata }) => {
  if (!isGroup) return conn.sendMessage(from, { text: "❌ Only works in group chats!" }, { quoted: mek });

  const { isAdmin, resolvedSender } = checkIsAdmin(sender, groupMetadata);
  if (!isAdmin) return sendText(conn, from, "❌ Only *group admins* can update the group name.", mek, [sender]);

  const newName = args.join(" ").trim();
  if (!newName) return sendText(conn, from, "❌ Provide the new group name.\n📌 Example: `.setname Awesome Group`", mek);

  try {
    await conn.groupUpdateSubject(from, newName);

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
✏️ *HANS BYTE V2 – NAME CHANGE* ✏️
━━━━━━━━━━━━━━━━━━━━━━━

📌 *New Name:* ${newName}
⚡ *Updated by:* @${jidToNumber(resolvedSender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await sendText(conn, from, out, mek, [resolvedSender]);

  } catch (err) {
    console.error("setname error:", err);
    await sendText(conn, from, "❌ Failed to update group name. Make sure I have admin rights!", mek);
  }
});

// ------------------ setdesc ------------------
cmd({
  pattern: "setdesc",
  alias: ["updesc","groupdesc","gdesc","desc"],
  use: ".setdesc <new description>",
  desc: "Change group description (admins only).",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, args, groupMetadata }) => {
  if (!isGroup) return conn.sendMessage(from, { text: "❌ Only works in group chats!" }, { quoted: mek });

  const { isAdmin, resolvedSender } = checkIsAdmin(sender, groupMetadata);
  if (!isAdmin) return sendText(conn, from, "❌ Only *group admins* can update the description.", mek, [sender]);

  const newDesc = args.join(" ").trim();
  if (!newDesc) return sendText(conn, from, "❌ Provide the new group description.\n📌 Example: `.setdesc Welcome to Awesome Tech Group 🚀`", mek);

  try {
    await conn.groupUpdateDescription(from, newDesc);

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
📝 *HANS BYTE V2 – DESCRIPTION UPDATE* 📝
━━━━━━━━━━━━━━━━━━━━━━━

📌 *New Description:*
${newDesc}
⚡ *Updated by:* @${jidToNumber(resolvedSender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await sendText(conn, from, out, mek, [resolvedSender]);
  } catch (err) {
    console.error("setdesc error:", err);
    await sendText(conn, from, "❌ Failed to update group description. Make sure I have admin rights!", mek);
  }
});

// ------------------ promote ------------------
cmd({
  pattern: "promote",
  use: ".promote @user (or reply)",
  desc: "Promote a member to admin (admins only).",
  category: "group",
  filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, args, groupMetadata }) => {
  if (!isGroup) return conn.sendMessage(from, { text: "❌ Only works in groups!" }, { quoted: mek });

  const { isAdmin, maps, resolvedSender } = checkIsAdmin(sender, groupMetadata);
  if (!isAdmin) return sendText(conn, from, "⚠️ Only group admins can promote!", mek, [sender]);

  const rawTarget = m.mentionedJid?.[0] || (args[0] ? args[0].replace(/\D/g,"") : "") || m.message?.extendedTextMessage?.contextInfo?.participant;
  if (!rawTarget) return sendText(conn, from, "🔎 Mention or reply to the user you want to promote!", mek);

  const resolvedTarget = String(resolveToJid(rawTarget, maps) || rawTarget).toLowerCase();

  const isTargetAdmin = groupMetadata.participants.some(p => {
    const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
    return pid === resolvedTarget && (p.admin === "admin" || p.admin === "superadmin");
  });

  if (isTargetAdmin) return sendText(conn, from, `⚠️ @${jidToNumber(resolvedTarget)} is already an admin!`, mek, [resolvedTarget]);

  try {
    await conn.groupParticipantsUpdate(from, [resolvedTarget], "promote");

    const out = `
━━━━━━━━━━━━━━━━━━━━━━━
🛡️ *HANS BYTE V2 – PROMOTE* 🛡️
━━━━━━━━━━━━━━━━━━━━━━━

👤 *User:* @${jidToNumber(resolvedTarget)}
📌 *Action:* Promoted to Admin
⚡ *By:* @${jidToNumber(resolvedSender)}

━━━━━━━━━━━━━━━━━━━━━━━
🔥 Powered by HANS BYTE V2
━━━━━━━━━━━━━━━━━━━━━━━
    `;
    await sendText(conn, from, out, mek, [resolvedTarget, resolvedSender]);

  } catch (err) {
    console.error("promote error:", err);
    await sendText(conn, from, "❌ Failed to promote. Make sure I have permission to promote members.", mek);
  }
});
