const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js"); // fixed utils

cmd({
  pattern: "system-test",
  alias: ["sysdiag"],
  react: "🛠",
  desc: "Check your permissions, chat context, and resolved JID",
  category: "utility",
  use: ".system-test",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, isGroup, sender, reply, groupMetadata, config } = extra;

  try {
    // Load lid mappings once
    const maps = loadLidMappings();

    // Resolve sender to canonical JID (fallback to raw sender)
    const resolvedRaw = resolveToJid(sender, maps) || sender || "";
    const resolvedJid = String(resolvedRaw).toLowerCase();

    // Build canonical owner JIDs (handles single, array, or CSV)
    const rawOwners = Array.isArray(config?.OWNER_NUM)
      ? config.OWNER_NUM
      : String(config?.OWNER_NUM ?? process.env.OWNER_NUM ?? "237694668970")
          .split(',')
          .map(s => s.trim());

    const ownerJids = rawOwners
      .filter(Boolean)
      .map(o => {
        let s = String(o).trim();
        if (!s) return null;
        // append domain if numeric-only
        if (!s.includes('@') && /^\d{6,15}$/.test(s)) s = `${s}@s.whatsapp.net`;
        return s.toLowerCase();
      })
      .filter(Boolean);

    // Direct compare for owner (manual append approach)
    const isOwner = ownerJids.includes(resolvedJid);

    // Dev check (hardcoded dev number; compare canonical)
    const myDevNumber = "237694668970@s.whatsapp.net";
    const isDev = resolvedJid === myDevNumber.toLowerCase();

    // Admin check for groups (resolve participant ids)
    let isAdmin = false;
    if (isGroup && groupMetadata?.participants?.length) {
      isAdmin = groupMetadata.participants.some(p => {
        const pidRaw = resolveToJid(p.id, maps) || p.id || "";
        const pid = String(pidRaw).toLowerCase();
        const adminFlag = (p.admin === "admin" || p.admin === "superadmin");
        return pid === resolvedJid && adminFlag;
      });
    }

    // Debug log
    console.log(`[SYSTEM-TEST] sender: ${sender} → resolved: ${resolvedJid}`);
    console.log(`[SYSTEM-TEST] ownerJids: ${JSON.stringify(ownerJids)}`);

    // Compose and send report
    const report = `
🔧 System Test Report 🔧

Chat type : ${isGroup ? "Group" : "DM"}
JID       : ${resolvedJid}
Is Owner  : ${isOwner ? "✅ Yes" : "❌ No"}
Is Admin  : ${isAdmin ? "✅ Yes" : "❌ No"}
Is Dev    : ${isDev ? "✅ Yes" : "❌ No"}
`;
    await safeReply(conn, mek.key.remoteJid, report);

  } catch (err) {
    try { await safeReply(conn, mek.key.remoteJid, "Error: " + String(err)); } catch {}
    console.error("[SYSTEM-TEST ERROR]:", err);
  }
});
