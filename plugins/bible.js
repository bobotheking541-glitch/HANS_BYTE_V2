const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
  pattern: 'bible',
  desc: 'Receive a blessing from the Holy Scriptures',
  category: 'religion',
  react: '✝️',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    const reference = args.join(' ').trim();
    if (!reference) return safeReply(conn, mek.key.remoteJid, '🙏 Please provide a Bible reference. Example: `bible John 3:16`');

    // Parse "Book chapter:verse[-end]"
    const refMatch = reference.match(/^(.+?)\s+(\d+)(?::(\d+(?:-\d+)?))?$/i);
    if (!refMatch) return safeReply(conn, mek.key.remoteJid, '⚠️ Could not parse that reference. Use format like `John 3:16` or `Genesis 1`.');

    const book = refMatch[1].trim();
    const chapter = parseInt(refMatch[2], 10);
    const versePart = refMatch[3] || null;

    let verseStart = null, verseEnd = null;
    if (versePart) {
      if (versePart.includes('-')) {
        [verseStart, verseEnd] = versePart.split('-').map(Number);
      } else {
        verseStart = parseInt(versePart, 10);
        verseEnd = verseStart;
      }
    }

    // Build API URL
    let apiUrl = `https://hanstech-api.zone.id/api/bible?book=${encodeURIComponent(book)}&chapter=${chapter}&key=hans~ikDKbXN`;
    if (verseStart) apiUrl += `&verse=${verseStart}`;

    const res = await fetchJson(apiUrl);
    if (!res || res.status !== 'success' || !res.data) {
      return safeReply(conn, mek.key.remoteJid, '⚠️ Could not fetch the verse. Please check your reference.');
    }

    // Format message
    let refText = `${res.data.book} ${chapter}`;
    if (verseStart) refText += `:${verseStart}${verseEnd && verseEnd !== verseStart ? '-' + verseEnd : ''}`;

    let message = `✝️ *${refText}* — *${res.data.version}*\n\n`;
    message += `${res.data.text}\n\n🕊️ *May God bless you as you meditate on His Word.*`;

    await safeSend(conn, from, { text: message }, { quoted: mek });

  } catch (err) {
    console.error(err);
    return safeReply(conn, mek.key.remoteJid, `⚠️ Error: ${err.message || err}\n\n🙏 Try again later.`);
  }
});
