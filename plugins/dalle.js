const { cmd } = require('../command');
const axios = require('axios');

// Channel newsletter context
const newsletterContext = {
  mentionedJid: [],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363422794491778@newsletter', // Example newsletter JID
    newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
    serverMessageId: 143,
  },
};

// Define the FluxAI image generation command
cmd(
  {
    pattern: 'dalle',
    alias: ['imagine'],
    react: '💧',
    desc: 'Generate AI images using FluxAI API.',
    category: 'ai',
    use: '.gen <Your Question>',
    filename: __filename,
  },
  async (bot, message, chatData, { reply, args }) => {
    try {
      // Get the user's prompt
      const prompt = args.join(' ');
      if (!prompt) {
        return safeReply(conn, mek.key.remoteJid, '❗️ Please provide a prompt.');
      }

      // Construct the API request URL
      const apiUrl = `https://apis.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(prompt)}`;

      // React with 🎨 to indicate processing
      await bot.sendMessage(chatData.key.remoteJid, {
        react: { text: '🎨', key: chatData.key },
      });

      // Fetch the AI-generated image
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // Send the generated image
      await bot.sendMessage(chatData.key.remoteJid, {
        contextInfo: newsletterContext,
        image: Buffer.from(response.data),
        caption: `🖼 Generated Image for: *${prompt}*\n\n> BY HANS BYTE`,
      });
    } catch (error) {
      console.error('Error:', error);
      safeReply(conn, mek.key.remoteJid, '❌ Error generating image.');
    }
  }
);