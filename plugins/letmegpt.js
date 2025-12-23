const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "letmegpt",
  alias: ["lmgpt", "gptchat"],
  react: "🤖",
  desc: "Chat with LetMeGPT AI",
  category: "💬 AI",
  use: ".letmegpt [your question]",
  filename: __filename,
}, async (conn, mek, m, { from, q, sender, reply, pushname }) => {
  try {
    // Default prompt if none provided
    const prompt = q ? q : `Hello, I am ${pushname}`;

    // Call LetMeGPT API
    const api = `https://api.giftedtech.co.ke/api/ai/letmegpt?apikey=gifted_api_6kuv56877d&q=${encodeURIComponent(prompt)}`;
    const res = await axios.get(api);
    const json = res.data;

    if (!json.success || !json.result) return reply("⚠️ Failed to get response from LetMeGPT AI.");

    // Forwarded newsletter style
    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363422794491778@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
        serverMessageId: 600,
      },
      externalAdReply: {
        title: `HANS BYTE MD`,
        body: `BY HANS TECH`,
        mediaType: 2,
        thumbnailUrl: "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg",
        showAdAttribution: true,
        sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O",
      }
    };

    // Send AI response
    await conn.sendMessage(from, {
      text: `💡 *\n\n${json.result}`,
      contextInfo,
    }, { quoted: mek });

  } catch (err) {
    console.error(err.response?.data || err);
    reply("❌ An error occurred while contacting LetMeGPT. Please try again later.");
  }
});
