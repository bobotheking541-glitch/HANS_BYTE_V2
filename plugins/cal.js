const { cmd } = require('../command');

cmd({
    pattern: "calendar",
    alias: "cal",
    desc: "Show calendar of current or given month & year (GMT).",
    react: "🗓️",
    category: "utilities",
    filename: __filename
},
async (conn, mek, m, { from, q, sender, reply }) => {
    try {
        let [month, year] = q.trim().split(" ").map(x => parseInt(x));
        const now = new Date();

        if (!month || month < 1 || month > 12) month = now.getUTCMonth() + 1;
        if (!year || year < 1000) year = now.getUTCFullYear();

        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        // Build calendar lines per week for better mobile display
        let output = `🗓️ *Calendar for ${month}/${year} (GMT)*\n\n`;

        // Print day headers in a single line with spacing
        output += days.map(d => `*${d}*`).join("  ") + "\n";

        // Prepare weeks array to hold each week string
        let weeks = [];
        let week = [];

        // Fill initial empty days of first week with spaces
        for (let i = 0; i < firstDay; i++) {
            week.push("  ");
        }

        // Fill days into weeks
        for (let date = 1; date <= daysInMonth; date++) {
            week.push(String(date).padStart(2, " "));
            if (week.length === 7 || date === daysInMonth) {
                weeks.push(week);
                week = [];
            }
        }

        // Convert weeks to string lines with spacing
        weeks.forEach(w => {
            output += w.join("  ") + "\n";
        });

        // Add some footer note
        output += `\n_Use "calendar <month> <year>" to see other months._`;

        await safeSend(conn, from, {
            text: output,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363422794491778@newsletter',
                    newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                    serverMessageId: 146,
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Calendar command error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ Error generating calendar. " + e.message);
    }
});
