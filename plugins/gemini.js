const { cmd } = require("../command");
const axios = require("axios");

const GOOGLE_API_KEY = "AIzaSyDJY_kdB1raLrHoie30MbO51HOol15V3B0";
const GEMINI_MODEL = "gemini-2.5-flash";

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
// HANS BYTE AI (Direct Gemini)
// ============================

cmd({
  pattern: "hansai",
  alias: ["ai", "gemini", "hansbyte"],
  react: "🤖",
  desc: "Ask anything to Hans Byte AI",
  category: "ai",
  use: ".hansai <Your Question>",
  filename: __filename
}, async (_context, _message, _args, {
  q,
  pushname,
  sender,
  reply
}) => {
  try {
    if (!q) return safeReply(conn, mek.key.remoteJid, "❗️ Please provide a question.");

    // 🔮 Strong system-style prompt
    const prompt = `
You are **HANS BYTE V2 🤖**, the upgraded and intelligent WhatsApp AI assistant.

Identity & Rules:
- Created by **HANS TECH**
- You run on **HANS BYTE V2**
- Never mention Google, Gemini, APIs, or models
- Speak naturally, friendly, and confidently
- Use relevant emojis but do not overdo them
- Be helpful, clear, and creative
- If asked who you are, say:
  "I am HANS BYTE V2, built by HANS TECH."

User: ${pushname}
Question: ${q}

Answer as HANS BYTE V2.
    `.trim();

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse =
      response.data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .join("");

    if (!aiResponse)
      return safeReply(conn, mek.key.remoteJid, "❌ Error: No response from Hans Byte AI.");

    const contextInfo = createNewsletterContext(sender);
    await safeReply(conn, mek.key.remoteJid, aiResponse, { contextInfo });

    console.log(`HANS BYTE V2 | Question by ${pushname}`);

  } catch (error) {
    console.error("HANS BYTE AI Error:", error.response?.data || error.message);
    safeReply(conn, mek.key.remoteJid, "❌ Hans Byte V2 encountered a system error ⚠️");
  }
});
