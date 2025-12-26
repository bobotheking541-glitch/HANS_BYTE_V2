// plugins/alive.js
const os = require('os');
const config = require('../config');
const { cmd } = require('../command');

function formatUptime(seconds) {
  const pad = (s) => (s < 10 ? '0' : '') + s;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

cmd({
  pattern: 'alive',
  react: '🛸',
  desc: 'Check bot online status.',
  category: 'main',
  filename: __filename
}, async (conn, mek, m, { from, reply, pushname }) => {
  const quotedOption = mek && typeof mek === 'object' ? { quoted: mek } : {};
  const IMG = 'https://files.catbox.moe/wdi4cg.jpeg';

  try {
    const uptime = formatUptime(process.uptime());
    const freemem = Math.round(os.freemem() / 1024 / 1024);
    const totalmem = Math.round(os.totalmem() / 1024 / 1024);

    const caption =
      `🛰️ *HANS BYTE V2 — STATUS PANEL*\n\n` +
      `👤 *User:* ${pushname || 'Anonymous'}\n` +
      `🤖 *Bot:* Online & Active\n` +
      `🕐 *Uptime:* ${uptime}\n` +
      `💻 *Host:* ${os.hostname()}\n` +
      `⚙️ *Platform:* ${os.platform()} ${os.arch()}\n` +
      `📦 *Memory:* ${freemem}MB Free / ${totalmem}MB Total\n` +
      `🚀 *USAGE:* Type ${config.PREFIX}menu to start`;

    // Interactive Buttons Payload
    const interactivePayload = {
      image: { url: IMG },
      caption,
      footer: 'HANS BYTE V2',
      interactiveButtons: [
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📢 JOIN CHANNEL',
            url: 'https://whatsapp.com/channel/0029Vb6F9V9FHWpsqWq1CF14'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📞 CONTACT OWNER',
            url: 'https://wa.me/237696900612'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '💻 VISIT REPO',
            url: 'https://github.com/Haroldmth/HANS_BYTE_V2'
          })
        },
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: '🔗 COPY REPO LINK',
            copy_code: 'https://github.com/Haroldmth/HANS_BYTE_V2'
          })
        },
        {
          name: 'open_webview',
          buttonParamsJson: JSON.stringify({
            title: '🌐 Open Channel in WebView',
            link: {
              in_app_webview: true,
              url: 'https://whatsapp.com/channel/0029Vb6F9V9FHWpsqWq1CF14'
            }
          })
        }
      ]
    };

    await safeSend(conn, from, interactivePayload, quotedOption);

  } catch (e) {
    console.error('Alive command error:', e);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message || e}`);
  }
});
