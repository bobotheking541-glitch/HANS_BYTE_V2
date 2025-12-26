const { cmd } = require("../command");
const axios = require("axios");

const ITZPIRE_API = "https://itzpire.my.id/stalk/whatsapp-channel";
// if API key is needed later, add it here
// const API_KEY = "YOUR_API_KEY";

cmd({
  pattern: "wastalk",
  alias: ["channelstalk", "chinfo"],
  react: "🔎",
  desc: "Stalk WhatsApp Channel using ITzpire API",
  category: "stalk",
  filename: __filename,
}, async (robin, mek, m, { from, q, reply }) => {
  try {
    const url =
      (q && q.trim()) ||
      (m?.text ? m.text.trim().split(/\s+/).slice(1).join(" ") : "");

    if (!url) {
      return reply(
        "❌ Provide a WhatsApp Channel URL\n\n" +
        "Example:\n.wastalk https://whatsapp.com/channel/0029Vb6F9V9FHWpsqWq1CF14"
      );
    }

    if (!url.includes("whatsapp.com/channel/")) {
      return reply("❌ Invalid WhatsApp Channel URL");
    }

    const res = await axios.get(ITZPIRE_API, {
      params: { url },
      // headers: { "x-api-key": API_KEY } // if required later
    });

    if (!res.data || res.data.status !== "success") {
      return reply("❌ Failed to fetch channel info from API");
    }

    const data = res.data.data;

    const caption =
      `📡 *WhatsApp Channel Info*\n\n` +
      `📛 *Name:* ${data.title || "Unknown"}\n` +
      `👥 *Followers:* ${data.followers || "N/A"}\n` +
      `📌 *Description:* ${data.description || "None"}\n\n` +
      `⚡ HANS BYTE V2 ⚡`;

    if (data.img) {
      await robin.sendMessage(
        from,
        {
          image: { url: data.img },
          caption,
        },
        { quoted: mek }
      );
    } else {
      await robin.sendMessage(from, { text: caption }, { quoted: mek });
    }

  } catch (err) {
    console.error("wastalk api error:", err?.response?.data || err);
    reply("❌ Error fetching channel info (API issue)");
  }
});
