const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "waifu",
  alias: ["animegirl", "bestgirl"],
  react: "💖",
  desc: "Get a random waifu image",
  category: "fun",
  use: ".waifu",
  filename: __filename,
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const waifuUrl = "https://apis.davidcyriltech.my.id/random/waifu";
    
    // Newsletter context info
    const newsletterContext = {
      mentionedJid: [sender],
      forwardingScore: 1000,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363292876277898@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
        serverMessageId: 143,
      },
    };

    await conn.sendMessage(from, {
      image: { url: waifuUrl },
      caption: "*Here's your waifu! 💖*",
      contextInfo: newsletterContext,
    }, { quoted: mek });

  } catch (error) {
    console.error("Error fetching waifu image:", error);
    reply(`An error occurred while fetching your waifu. Please try again later.\n\nError: ${error.message || error}`);
  }
});