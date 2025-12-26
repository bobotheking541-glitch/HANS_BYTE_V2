const { cmd } = require("../command");
const axios = require("axios");

// Function to dynamically create newsletter context per message
const createNewsletterContext = (sender) => ({
  mentionedJid: [sender],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363422794491778@newsletter",
    newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
    serverMessageId: 143,
  },
});

// ============================
// HANS BYTE AI (with branding)
// ============================

cmd({
  pattern: "story",
  alias: ["tellmeastory", "storytime"],
  react: "📖",
  desc: "Create an epic story from your prompt",
  category: "ai",
  use: "story <Your Prompt>",
  filename: __filename
}, async (_context, _message, _args, {
  from,
  quoted,
  q,
  pushname,
  sender,
  reply
}) => {
  try {
    if (!q) return safeReply(conn, mek.key.remoteJid, "❗️ Please provide a question.");

    const userQuery = `Hey there! I’m ${pushname} . Whatever I say—no matter how random, weird, or short—turn it into an incredible story. Make it long, thrilling, and unforgettable, filled with adventure, emotion, and vivid details that draw the reader in. Don’t hold back—make every sentence epic, exciting, and immersive and make use of emojis to spice up all. Here’s what I want to share:
${q} ❓`;

    const apiUrl = `https://api.giftedtech.co.ke/api/ai/geminiai?apikey=gifted_api_6kuv56877d&q=${encodeURIComponent(userQuery)}`;
    const response = await axios.get(apiUrl);

    const aiResponse = response.data?.result;
    if (!aiResponse) return safeReply(conn, mek.key.remoteJid, "❌ Error: No response from AI.");

    const contextInfo = createNewsletterContext(sender);
    await safeReply(conn, mek.key.remoteJid, aiResponse, { contextInfo });

    console.log(`Question by: ${pushname}`);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    safeReply(conn, mek.key.remoteJid, "❌ Error processing your question 😢");
  }
});

