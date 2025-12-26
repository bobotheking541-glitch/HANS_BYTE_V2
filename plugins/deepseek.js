const { cmd, commands } = require('../command');
const axios = require('axios');
const path = require('path');

cmd(
  {
    pattern: "deepseek",
    alias: ["dpseek", "ai2"],
    react: "🤖",
    desc: "Get AI responses from DeepSeek API.",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      // Default message if no input
      q = q || "Hi";

      // Newsletter context info
      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363422794491778@newsletter',
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
          serverMessageId: 143,
        },
      };

      // API URL for DeepSeek AI
      let apiUrl = `https://apis.davidcyriltech.my.id/ai/deepseek-r1?text=${encodeURIComponent(q)}`;

      // Fetch AI response from DeepSeek API
      let { data } = await axios.get(apiUrl);

      if (!data || !data.response) {
        return safeReply(conn, mek.key.remoteJid, "❌ AI response error! Please try again.");
      }

      // Send AI response with newsletter context
      await robin.sendMessage(
        from,
        { 
          text: `${data.response}`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

      // You can send other responses if necessary, like an image, etc.
      // Example: send an image after the AI response

    } catch (e) {
      console.error(e);
      safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message}`);
    }
  }
);