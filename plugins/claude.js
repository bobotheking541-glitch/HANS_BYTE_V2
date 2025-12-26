const { cmd } = require('../command');
const axios = require('axios');

cmd(
  {
    pattern: "claude",
    alias: ["claudeai", "sonnet", "ai3"],
    react: "🧠",
    desc: "Chat with Claude AI (clean, controlled, no drama)",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, sender, q, reply }
  ) => {
    try {
      q = q || "Hi Claude";

      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363422794491778@newsletter',
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
          serverMessageId: 143,
        },
      };

      // ✅ NORMAL QUERY — no identity coercion
      const apiUrl = `https://www.itzpire.my.id/ai/claude?q=${encodeURIComponent(q)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.result) {
        return safeReply(conn, mek.key.remoteJid, "❌ Claude AI failed to respond.");
      }

      // 🧼 CLEAN + DISCLAIMER CONTROL
      let cleanText = data.result
        // spacing fixes
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
        .replace(/([.!?])([A-Za-z])/g, "$1 $2")
        .replace(/-1$/g, "")
        .replace(/\s+/g, " ")
        // remove identity disclaimer paragraphs
        .replace(/I'm Claude.*?systems\./gi, "")
        .replace(/I was developed.*?technology\./gi, "")
        .trim();

      await robin.sendMessage(
        from,
        {
          text:
`${cleanText}`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

    } catch (err) {
      console.error(err);
      safeReply(conn, mek.key.remoteJid, `❌ Error: ${err.message}`);
    }
  }
);
