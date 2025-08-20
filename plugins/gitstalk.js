const { cmd } = require('../command');
const fetch = require('node-fetch');
const channelurl = "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O";
cmd({
    pattern: "gitstalk",
    alias: ["githubstalk", "ghstalk"],
    react: "🐙",
    desc: "🔍 Stalk any GitHub user profile",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide a GitHub username!*\nExample: `.gitstalk HaroldMth`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://api.giftedtech.co.ke/api/stalk/gitstalk?apikey=gifted&username=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.success || !data?.result) {
            return reply("❌ *No GitHub profile found. Please check the username!*");
        }

        const gh = data.result;
        const gitInfo = `
*🐙 GitHub Profile Stalker*

*👤 Username:* ${gh.login}
*🆔 ID:* ${gh.id}
*📦 Public Repos:* ${gh.public_repos}
*📑 Public Gists:* ${gh.public_gists}
*👥 Followers:* ${gh.followers}
*➡️ Following:* ${gh.following}
*📅 Created:* ${new Date(gh.created_at).toDateString()}
*♻️ Last Updated:* ${new Date(gh.updated_at).toDateString()}

*🔗 Profile:* ${gh.html_url}
${gh.blog ? `*🌐 Blog:* ${gh.blog}` : ""}
${gh.bio ? `*📝 Bio:* ${gh.bio}` : ""}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 145,
            },
            externalAdReply: {
                title: "🐙 GitHub Stalker",
                body: `👤 ${gh.login} — Profile Stats`,
                mediaType: 1,
                thumbnailUrl: gh.avatar_url,
                sourceUrl: channelurl
            }
        };

        await conn.sendMessage(
            from,
            { text: gitInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("GitHub Stalk Error:", e);
        reply("❌ *Error fetching GitHub profile:* " + e.message);
    }
});
