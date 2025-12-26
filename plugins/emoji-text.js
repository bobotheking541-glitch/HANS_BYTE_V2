const { cmd, commands } = require('../command');


cmd(
  {
    pattern: "emoji",
    react: "🔠",
    desc: "Convert text to emoji representation.",
    category: "fun",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      const text = q;

      if (!text) {
        return safeReply(conn, mek.key.remoteJid, "❌ Please provide some text to convert into emojis!");
      }

      // Map text to corresponding emoji characters
      const emojiMapping = {
        "a": "🅰️",
        "b": "🅱️",
        "c": "🇨️",
        "d": "🇩️",
        "e": "🇪️",
        "f": "🇫️",
        "g": "🇬️",
        "h": "🇭️",
        "i": "🇮️",
        "j": "🇯️",
        "k": "🇰️",
        "l": "🇱️",
        "m": "🇲️",
        "n": "🇳️",
        "o": "🅾️",
        "p": "🇵️",
        "q": "🇶️",
        "r": "🇷️",
        "s": "🇸️",
        "t": "🇹️",
        "u": "🇺️",
        "v": "🇻️",
        "w": "🇼️",
        "x": "🇽️",
        "y": "🇾️",
        "z": "🇿️",
        "0": "0️⃣",
        "1": "1️⃣",
        "2": "2️⃣",
        "3": "3️⃣",
        "4": "4️⃣",
        "5": "5️⃣",
        "6": "6️⃣",
        "7": "7️⃣",
        "8": "8️⃣",
        "9": "9️⃣",
        " ": "␣" // for space
      };

      // Convert the input text into emoji form
      const emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

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

      // Send the emoji text reply with the newsletter context
      await robin.sendMessage(
        from,
        {
          text: `🔠 Emoji Text: *${emojiText}*`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error(e);
      safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message}`);
    }
  }
);