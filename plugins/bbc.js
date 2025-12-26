const axios = require('axios');
const { cmd } = require('../command');

cmd({
  pattern: 'bbcnews',
  alias: ['bbc'],
  desc: 'Get the latest BBC News in English.',
  react: '📰',
  use: '.bbcnews',
  category: 'News',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    const res = await axios.get('https://bbc-news-api.vercel.app/news?lang=english');
    const newsList = res.data?.Latest;

    if (!newsList || newsList.length === 0) {
      return safeReply(conn, mek.key.remoteJid, '❌ No BBC news found at the moment.');
    }

    // Format top 3 news
    let message = `📰 *Latest BBC News (English UK)*\n\n`;
    newsList.slice(0, 3).forEach((news, i) => {
      message += `*${i + 1}. ${news.title}*\n`;
      message += `${news.summary || 'No summary available.'}\n`;
      message += `🔗 Read more: ${news.news_link}\n\n`;
    });

    message += `*© POWERED BY HANS BYTE ✘*`;

    await safeSend(conn, from, { text: message }, { quoted: mek });

  } catch (error) {
    console.error('BBC News Fetch Error:', error.response?.data || error.message);
    safeReply(conn, mek.key.remoteJid, '❌ Failed to fetch BBC News. Please try again later.');
  }
});
