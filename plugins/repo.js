const { cmd } = require('../command');
const fetch = require('node-fetch');
const os = require('os');

const REPO_OWNER = 'Haroldmth';
const REPO_NAME = 'HANS_BYTE_V2';
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

let cache = {
    data: null,
    time: 0
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'HANS-BYTE-BOT' },
            signal: controller.signal
        });
        return await res.json();
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

cmd({
    pattern: 'repo',
    react: '📦',
    desc: 'HANS BYTE V2 repository & bot information',
    category: 'info',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // ⚡ serve from cache
        if (cache.data && Date.now() - cache.time < CACHE_TTL) {
            return conn.sendMessage(from, cache.data, { quoted: mek });
        }

        // 🚀 fetch in parallel
        const [repo, changelog] = await Promise.all([
            fetchWithTimeout(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`),
            fetchWithTimeout(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/data/changelog.json`)
        ]);

        const version = changelog?.version || 'Unknown';

        const uptime = formatUptime(process.uptime());
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(0);

        const caption = `
╔══✦❘༻ *HANS BYTE V2* ༺❘✦══╗
┇ 🤖 *BOT INFORMATION*
┇╭─────────────────────
┇│•📛 Name: HANS BYTE V2
┇│•👑 Owner: HANS TECH
┇│•⚡ Repo: ${REPO_URL}
┇│•🔖 Version: ${version}
┇│•⏳ Uptime: ${uptime}
┇│•💾 RAM: ${ramUsed}MB / ${ramTotal}MB
┇│•⭐ Stars: ${repo?.stargazers_count || 0}
┇│•🍴 Forks: ${repo?.forks_count || 0}
┇│•🐞 Issues: ${repo?.open_issues_count || 0}
┇│•🧩 Language: ${repo?.language || 'N/A'}
┇╰─────────────────────
╰─> 🚀 POWERED BY HANS BYTE V2
`;

        const messagePayload = {
            image: { url: 'https://files.catbox.moe/wdi4cg.jpeg' },
            caption
        };

        // 💾 cache final payload
        cache = {
            data: messagePayload,
            time: Date.now()
        };

        await conn.sendMessage(from, messagePayload, { quoted: mek });

    } catch (err) {
        console.error('Repo command error:', err);
        reply('❌ Error while loading repository info.');
    }
});
