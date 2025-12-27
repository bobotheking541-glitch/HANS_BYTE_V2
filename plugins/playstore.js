const { cmd } = require("../command");
const axios = require("axios");

// Helper function for safe replies
async function safeReply(conn, jid, text, options = {}) {
    try {
        return await conn.sendMessage(jid, { text, ...options });
    } catch (error) {
        console.error("Safe reply error:", error);
    }
}

cmd({
    pattern: "playstore",
    react: '📲',
    alias: ["ps", "appstalk", "playstorestalk"],
    desc: "Search for an app on the Play Store",
    category: "search",
    filename: __filename
},
async (conn, mek, m, { from, q, sender }) => {
    try {
        if (!q) {
            return await safeReply(conn, from, "❌ Please provide an app name to search.\n\nExample: .playstore whatsapp");
        }

        await safeReply(conn, from, "🔍 Searching Play Store...");

        const apiUrl = `https://api.giftedtech.co.ke/api/search/playstore?apikey=gifted_api_6kuv56877d&query=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.success || !response.data.results || response.data.results.length === 0) {
            return await safeReply(conn, from, "❌ No results found for the given app name.");
        }

        const app = response.data.results[0]; // Take the first result

        const infoMessage = `
╔══✦❘༻ *HANS BYTE* ༺❘✦══╗
┇  📲 *PLAY STORE SEARCH* 📲
┇╭─────────────────────
┇│•📌 Name: ${app.name}
┇│•👨‍💻 Developer: ${app.developer}
┇│•⭐ Rating: ${app.rating_Num} (${app.rating})
┇│•🌐 Developer Link: ${app.link_dev}
┇│•🔗 App Link: ${app.link}
┇╰─・─・─・─・─・─・─・─╯
╰─・─・─・─・─・──・─・─・─╯
> POWERED BY HANS BYTE MD`.trim();

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

        // Send app icon with full info
        if (app.img) {
            await conn.sendMessage(
                from,
                {
                    image: { url: app.img },
                    caption: infoMessage,
                    contextInfo: newsletterContext
                },
                { quoted: mek }
            );
        } else {
            await safeReply(conn, from, infoMessage);
        }

    } catch (error) {
        console.error("Play Store Error:", error);
        await safeReply(conn, from, "❌ Error searching for the app. Please try again.");
    }
});
