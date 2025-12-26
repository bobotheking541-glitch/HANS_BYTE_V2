const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
  pattern: 'math',
  alias: ['solve','calc'],
  desc: 'Solve a math expression using Hans Tech math-solver',
  category: '🧮 Utilities',
  react: '➗',
  filename: __filename
}, async (conn, mek, m, { from, args, reply, sender }) => {
  try {
    const expr = args.join(' ').trim();
    if (!expr) return safeReply(conn, mek.key.remoteJid, '❌ Please provide a math expression. Example: `math 1/2` or `calc 2+2*3`');

    // Build API URL (encode expression)
    const apiUrl = `https://hanstech-api.zone.id/api/math-solver?expr=${encodeURIComponent(expr)}&key=hans%7EUfvyXEb`;

    // Fetch Hans Tech result
    const res = await fetch(apiUrl, { method: 'GET' });
    const json = await res.json();

    // Expected example: { status:"success", expression:"1/2", result:0.5 }
    if (!json || (json.status && json.status !== 'success')) {
      console.error('Math API error:', json);
      return safeReply(conn, mek.key.remoteJid, '⚠️ Failed to solve the expression. Make sure it is a valid math expression.');
    }

    const expression = json.expression ?? expr;
    const result = (json.result !== undefined && json.result !== null) ? String(json.result) : 'No result';

    // Nicely formatted reply
    const message = [
      '🧮 *Hans Tech — Math Solver*',
      '',
      `*Expression:* ${expression}`,
      `*Result:* ${result}`,
      '',
      '🔎 Use operators like + - * / ^ and functions like sin(), cos(), sqrt(), etc.'
    ].join('\n');

    await safeSend(conn, from, { text: message }, { quoted: mek });
  } catch (err) {
    console.error(err);
    return safeReply(conn, mek.key.remoteJid, `⚠️ Error: ${err.message || err}\n\nPlease try again.`);
  }
});
