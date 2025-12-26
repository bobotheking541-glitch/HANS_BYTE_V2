const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

cmd({
  pattern: "person",
  alias: ["userinfo", "whois", "profile"],
  react: "👤",
  desc: "Get complete user profile information",
  category: "utility",
  use: ".person [@tag or reply]",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, reply, groupMetadata, args } = extra;

  try {
    const maps = loadLidMappings();

    // ── Resolve target ─────────────────────────────
    let rawTarget = sender;
    if (m?.mentionedJid?.length) rawTarget = m.mentionedJid[0];
    else if (m?.quoted?.sender) rawTarget = m.quoted.sender;
    else if (args?.[0]) {
      const n = args[0].replace(/[^0-9]/g, "");
      if (n) rawTarget = `${n}@s.whatsapp.net`;
    }

    let target = resolveToJid(rawTarget, maps) || rawTarget;
    target = String(target).toLowerCase();

    const number = target.split("@")[0];

    // ── Name resolution (never Unknown) ───────────
    let contactName = number;
    const store = conn.store?.contacts || conn.contacts;
    if (store) {
      const entry = typeof store.get === "function" ? store.get(target) : store[target];
      if (entry) {
        contactName =
          entry.notify ||
          entry.vname ||
          entry.name ||
          entry.pushname ||
          number;
      }
    }

    // ── Profile picture ───────────────────────────
    let ppUrl = null;
    try {
      ppUrl = await conn.profilePictureUrl(target, "image");
    } catch {}

    // ── About / Bio (this IS the only legit way) ──
    let about = "No bio/status available";
    let aboutTime = "N/A";
    try {
      const status = await conn.fetchStatus(target);
      if (status?.status) about = status.status;
      if (status?.setAt) {
        aboutTime = new Date(status.setAt * 1000).toLocaleString();
      }
    } catch {}

    // ── WhatsApp registration check ───────────────
    let isRegistered = "Unknown";
    try {
      const wa = await conn.onWhatsApp(target);
      isRegistered = wa?.length ? "✅ Yes" : "❌ No";
    } catch {}

    // ── Business info ─────────────────────────────
    let accountType = "Personal";
    let businessCategory = "N/A";
    try {
      const isBiz = await conn.isBusiness?.(target);
      if (isBiz) {
        accountType = "Business";
        const biz = await conn.getBusinessProfile?.(target).catch(() => null);
        if (biz?.category) businessCategory = biz.category;
      }
    } catch {}

    // ── Presence (online / last seen) ─────────────
    let presenceInfo = "Unavailable";
    const pres = conn.presences?.[target];
    if (pres?.lastKnownPresence) {
      presenceInfo = pres.lastKnownPresence;
    } else if (pres?.presence) {
      presenceInfo = pres.presence;
    }

    // ── Group role ─────────────────────────────────
    let groupRole = "N/A";
    if (isGroup && groupMetadata?.participants?.length) {
      const p = groupMetadata.participants.find(x => {
        const pid = resolveToJid(x.id, maps) || x.id;
        return String(pid).toLowerCase() === target;
      });
      if (p) {
        groupRole =
          p.admin === "superadmin"
            ? "👑 Super Admin"
            : p.admin === "admin"
            ? "🛡️ Admin"
            : "👤 Member";
      }
    }

    // ── Final message ─────────────────────────────
    const caption = `
*GC MEMBER INFORMATION 🧊*

📛 *Name:* ${contactName}
🔢 *Number:* ${number}
📌 *Account Type:* ${accountType}
🏷️ *Business Category:* ${businessCategory}

📝 *About:*
${about}
🕒 *Bio Updated:* ${aboutTime}

⚙️ *Account Info:*
📲 *Registered on WhatsApp:* ${isRegistered}
👥 *Group Role:* ${groupRole}
🟢 *Presence:* ${presenceInfo}
📌 *Resolved JID:* ${target}
`.trim();

    // ── Send ──────────────────────────────────────
    if (ppUrl) {
      await safeSend(conn, 
        from,
        { image: { url: ppUrl }, caption, mentions: [target] },
        { quoted: m }
      );
    } else {
      await safeSend(conn, 
        from,
        { text: caption, mentions: [target] },
        { quoted: m }
      );
    }

  } catch (err) {
    console.error("[PERSON ERROR]", err);
    try { await safeReply(conn, mek.key.remoteJid, "❌ Error: " + String(err)); } catch {}
  }
});
