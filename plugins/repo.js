const { cmd } = require('../command');
const fetch = require('node-fetch');
const axios = require('axios');
const os = require('os');

const REPO_OWNER = 'Haroldmth';
const REPO_NAME = 'HANS_BYTE_V2';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
const CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb6F9V9FHWpsqWq1CF14';

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

cmd({
    pattern: 'repo',
    react: '📦',
    desc: 'HANS BYTE V2 repository & bot information',
    category: 'info',
    filename: __filename
}, async (conn, mek, m, { from, pushname, reply }) => {
    try {
        // Fetch GitHub repo info
        const repoRes = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
            { headers: { 'User-Agent': 'HANS-BYTE-BOT' } }
        );

        if (!repoRes.ok) {
            return reply('❌ Unable to fetch HANS BYTE V2 repository info.');
        }

        const gh = await repoRes.json();

        // Fetch version from changelog.json
        let version = 'Unknown';
        try {
            const { data } = await axios.get(
                `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/data/changelog.json`
            );
            version = data.version || 'Unknown';
        } catch {
            version = 'Not found';
        }

        // System info
        const uptime = formatUptime(process.uptime());
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);

        const caption = `
╔══✦❘༻ *HANS BYTE V2* ༺❘✦══╗
┇ 🤖 *BOT INFORMATION*
┇╭─────────────────────
┇│•📛 Name: HANS BYTE V2
┇│•👑 Owner: HANS TECH
┇│•🔖 Version: ${version}
┇│•⏳ Uptime: ${uptime}
┇│•💾 RAM: ${ramUsed}MB / ${ramTotal}MB
┇│•⚙️ Platform: ${os.platform()} ${os.arch()}
┇│•⭐ Stars: ${gh.stargazers_count}
┇│•🍴 Forks: ${gh.forks_count}
┇│•🐞 Issues: ${gh.open_issues_count}
┇│•🧩 Language: ${gh.language || 'N/A'}
┇╰─・─・─・─・─・─・─・─╯
╰─・─・─・─・─・──・─・─・─╯
> 🚀 POWERED BY HANS BYTE V2
`;

        const interactivePayload = {
            image: { url: 'https://files.catbox.moe/wdi4cg.jpeg' },
            caption,
            footer: 'HANS BYTE V2',
            interactiveButtons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⭐ STAR REPO',
                        url: REPO_URL
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🍴 FORK REPO',
                        url: `${REPO_URL}/fork`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 JOIN CHANNEL',
                        url: CHANNEL_URL
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 COPY REPO LINK',
                        copy_code: REPO_URL
                    })
                }
            ]
        };

        await safeSend(conn, from, interactivePayload, { quoted: mek });

    } catch (err) {
        console.error('Repo command error:', err);
        reply('❌ Error while loading HANS BYTE V2 repository info.');
    }
});
