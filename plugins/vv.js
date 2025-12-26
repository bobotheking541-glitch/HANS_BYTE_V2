const { cmd } = require('../command');
const { downloadMediaMessage } = require('../lib/msg.js');
const config = require('../config');

cmd({
  pattern: 'vv',
  alias: ['viewonce'],
  react: '↩️',
  desc: 'Extract image, video, audio and voice notes from view-once',
  category: 'utility',
  filename: __filename
}, async (robin, mek, m, { from, quoted, reply, sender }) => {
  try {
    if (!quoted) {
      return reply('❌ Reply to a view-once image, video, audio or voice note');
    }

    const hasImage = quoted.imageMessage;
    const hasVideo = quoted.videoMessage;
    const hasAudio = quoted.audioMessage;

    if (!hasImage && !hasVideo && !hasAudio) {
      return reply('❌ Unsupported media type');
    }

    const buffer = await downloadMediaMessage(quoted, 'buffer');
    if (!buffer) {
      return reply('❌ Failed to download media');
    }

    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: config.NEWSLETTER_JID || '120363292876277898@newsletter',
        newsletterName: config.NEWSLETTER_NAME || '𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃',
        serverMessageId: Math.floor(Math.random() * 9999)
      }
    };

    // 🖼️ IMAGE
    if (hasImage) {
      await robin.sendMessage(from, {
        image: buffer,
        mimetype: quoted.mimetype,
        contextInfo
      }, { quoted: mek });
    }

    // 🎥 VIDEO + 🎧 AUDIO EXTRACTION
    if (hasVideo) {
      // resend video
      await robin.sendMessage(from, {
        video: buffer,
        mimetype: quoted.mimetype,
        contextInfo
      }, { quoted: mek });

      // extract audio from video
      await robin.sendMessage(from, {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: false,
        contextInfo
      }, { quoted: mek });
    }

    // 🎶 AUDIO / 🎙️ VOICE NOTE
    if (hasAudio) {
      const isVoice = quoted.audioMessage?.ptt === true;

      await robin.sendMessage(from, {
        audio: buffer,
        mimetype: quoted.mimetype || 'audio/ogg; codecs=opus',
        ptt: isVoice, // 🎯 key line
        contextInfo
      }, { quoted: mek });
    }

    await robin.sendMessage(from, {
      react: { text: '✅', key: mek.key }
    });

  } catch (err) {
    console.error('vv error:', err);
    reply(`❌ Error: ${err.message}`);

    if (config.ERROR_CHAT) {
      await robin.sendMessage(
        config.ERROR_CHAT,
        { text: `❌ vv command error\nFrom: ${from}\n${err.stack}` }
      );
    }
  }
});
