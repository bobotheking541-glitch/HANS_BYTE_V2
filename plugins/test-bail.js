const { cmd } = require("../command");
const { resolveToJid, loadLidMappings } = require("../lid-utils.js");

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
    const maps = loadLidMappings();

    const resolvedRaw = resolveToJid(sender, maps) || sender || "";
    const resolvedJid = String(resolvedRaw).toLowerCase();

    const rawOwners = Array.isArray(config?.OWNER_NUM)
      ? config.OWNER_NUM
      : String(config?.OWNER_NUM ?? process.env.OWNER_NUM ?? "237694668970")
          .split(",")
          .map(s => s.trim());

    const ownerJids = rawOwners
      .filter(Boolean)
      .map(o => {
        let s = String(o).trim();
        if (!s.includes("@") && /^\d{6,15}$/.test(s))
          s = `${s}@s.whatsapp.net`;
        return s.toLowerCase();
      });

    const isOwner = ownerJids.includes(resolvedJid);

    const myDevNumber = "237694668970@s.whatsapp.net";
    const isDev = resolvedJid === myDevNumber;

    let isAdmin = false;
    if (isGroup && groupMetadata?.participants?.length) {
      isAdmin = groupMetadata.participants.some(p => {
        const pid = String(resolveToJid(p.id, maps) || p.id).toLowerCase();
        return (
          pid === resolvedJid &&
          (p.admin === "admin" || p.admin === "superadmin")
        );
      });
    }

    console.log(`[SYSTEM-TEST] sender: ${sender} → resolved: ${resolvedJid}`);
    console.log(`[SYSTEM-TEST] ownerJids: ${JSON.stringify(ownerJids)}`);

    const report = `
🔧 System Test Report 🔧

Chat type : ${isGroup ? "Group" : "DM"}
JID       : ${resolvedJid}
Is Owner  : ${isOwner ? "✅ Yes" : "❌ No"}
Is Admin  : ${isAdmin ? "✅ Yes" : "❌ No"}
Is Dev    : ${isDev ? "✅ Yes" : "❌ No"}
`;

    await safeReply(conn, from, report, m);

  } catch (err) {
    console.error("[SYSTEM-TEST ERROR]:", err);
    try {
      await safeReply(conn, from, "❌ Error: " + String(err), m);
    } catch {}
  }
});
