const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "cpt",
  alias: ["capcut", "capcut-dl"],
  desc: "To download Capcut templates.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return safeReply(conn, mek.key.remoteJid, "❌ Please provide a valid Capcut link.");
    }

    await safeSend(conn, from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(`https://api.diioffc.web.id/api/download/capcut?url=${encodeURIComponent(q)}`);
    const data = response.data;

    if (!data || data.status !== true || !data.result || !data.result.url) {
      return safeReply(conn, mek.key.remoteJid, "⚠️ Failed to fetch Capcut content. Please check the link and try again.");
    }

    // Sending the video
    await safeSend(conn, from, {
      video: { url: data.result.url },
      mimetype: "video/mp4",
      caption: `📥 *Capcut Template Downloaded HANS BYTE*\n🎥 *Title:* ${data.result.title}\n📏 *Size:* ${data.result.size}`
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    safeReply(conn, mek.key.remoteJid, "❌ An error occurred while processing your request. Please try again.");
  }
});