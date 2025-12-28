const { cmd } = require('../command');
const { downloadMediaMessage } = require('../lib/msg.js');
const config = require('../config');

cmd({
  pattern: 'status',
  alias: ['savestatus', 'stsave'],
  react: '📥',
  desc: 'Save image, video, audio or voice note from WhatsApp status (with caption)',
  category: 'utility',
  filename: __filename
}, async (robin, mek, m, { from, quoted, reply, sender }) => {
  try {
    if (!quoted) {
      return reply('❌ Reply to a status image, video, audio or voice note');
    }

    const hasImage = quoted.imageMessage;
    const hasVideo = quoted.videoMessage;
    const hasAudio = quoted.audioMessage;

    if (!hasImage && !hasVideo && !hasAudio) {
      return reply('❌ Unsupported status media type');
    }

    const buffer = await downloadMediaMessage(quoted, 'buffer');
    if (!buffer) {
      return reply('❌ Failed to download status media');
    }

    // 📌 CAPTION (works for image / video / audio)
    const caption =
      quoted.imageMessage?.caption ||
      quoted.videoMessage?.caption ||
      quoted.audioMessage?.caption ||
      '';

    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.NEWSLETTER_JID || '120363422794491778@newsletter',
        newsletterName: config.NEWSLETTER_NAME || '𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃',
        serverMessageId: Math.floor(Math.random() * 9999)
      }
    };

    // 🖼️ STATUS IMAGE
    if (hasImage) {
      await robin.sendMessage(from, {
        image: buffer,
        mimetype: quoted.mimetype,
        caption,
        contextInfo
      }, { quoted: mek });
    }

    // 🎥 STATUS VIDEO + 🎧 AUDIO
    if (hasVideo) {
      await robin.sendMessage(from, {
        video: buffer,
        mimetype: quoted.mimetype,
        caption,
        contextInfo
      }, { quoted: mek });

      // extract audio
      await robin.sendMessage(from, {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: false,
        contextInfo
      }, { quoted: mek });
    }

    // 🎶 STATUS AUDIO / 🎙️ VOICE
    if (hasAudio) {
      const isVoice = quoted.audioMessage?.ptt === true;

      await robin.sendMessage(from, {
        audio: buffer,
        mimetype: quoted.mimetype || 'audio/ogg; codecs=opus',
        ptt: isVoice,
        caption, // 👈 yes, audio captions are preserved
        contextInfo
      }, { quoted: mek });
    }

    await robin.sendMessage(from, {
      react: { text: '✅', key: mek.key }
    });

  } catch (err) {
    console.error('status save error:', err);
    reply(`❌ Error: ${err.message}`);

    if (config.ERROR_CHAT) {
      await robin.sendMessage(
        config.ERROR_CHAT,
        { text: `❌ status command error\nFrom: ${from}\n${err.stack}` }
      );
    }
  }
});
