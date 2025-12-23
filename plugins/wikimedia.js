const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "wikimedia",
  alias: ["wikiimg", "wikifetch"],
  desc: "Search Wikimedia images with style 🖼️✨",
  category: "search",
  react: "📸",
  use: ".wikimedia <title>",
  filename: __filename,
}, async (conn, mek, m, { q, reply, sender }) => {
  try {
    if (!q) return reply("⚠️ *Please provide a search title!*\n\nUsage: .wikimedia Elon Musk");

    reply("🔍 *Fetching Wikimedia images...*");

    const apiUrl = `https://api.giftedtech.co.ke/api/search/wikimedia?apikey=gifted_api_6kuv56877d&title=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
      return reply("😕 *No images found for your query.*");
    }

    // Build formatted reply text (only 5 results)
    let txt = `✨ 𝑾𝒊𝒌𝒊𝒎𝒆𝒅𝒊𝒂 𝐈𝐦𝐚𝐠𝐞𝐬 𝐟𝐨𝐫: *${q}* ✨\n\n`;

    data.results.slice(0, 5).forEach((item, i) => {
      txt += `🌟 *${i + 1}. ${item.title}*\n`;
      txt += `🔗 Source: ${item.source}\n`;
      txt += `🖼 Preview: ${item.image}\n\n`;
    });

    txt += "💡 *Powered by HANS BYTE 𝟐*";

    const newsletterContext = {
      mentionedJid: [sender],
      forwardingScore: 1000,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363422794491778@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
        serverMessageId: 143,
      },
    };

    await conn.sendMessage(mek.chat, {
      text: txt.trim(),
      contextInfo: newsletterContext
    }, { quoted: mek });

  } catch (e) {
    console.error("Wikimedia Search Error:", e);
    reply("❌ *Failed to fetch Wikimedia images.*\nTry again later!");
  }
});

cmd({
  pattern: "wikipedia",
  alias: ["wiki"],
  react: "📖",
  desc: "Fetch Wikipedia information and translate to English.",
  category: "information",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) {
      return await conn.sendMessage(
        from,
        { text: "Please provide a search query for Wikipedia.", contextInfo: newsletterContext },
        { quoted: mek }
      );
    }

    await conn.sendMessage(
      from,
      { text: "🔍 Searching Wikipedia...", contextInfo: newsletterContext },
      { quoted: mek }
    );

    // Step 1: Search Wikipedia for the page title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(q)}`;
    const searchResult = await fetchJson(searchUrl);

    const page = searchResult?.query?.search?.[0];
    if (!page) {
      return await conn.sendMessage(
        from,
        { text: "❌ No results found for your query.", contextInfo: newsletterContext },
        { quoted: mek }
      );
    }

    const pageTitle = page.title;

    // Step 2: Get the page summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const summary = await fetchJson(summaryUrl);

    const extract = summary.extract || "No summary available.";
    const thumb = summary.thumbnail?.source || "https://upload.wikimedia.org/wikipedia/en/archive/6/63/20100815113656%21Wikipedia-logo.png";

    const translated = await translate(extract, { to: "en" });

    let message = `📖 *Wikipedia Result*

📝 *Query:* ${q}
🔤 *Title:* ${pageTitle}

${translated.text}

🌐 *Link:* https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}

BY HANS BYTE MD`;

    await conn.sendMessage(
      from,
      {
        image: { url: thumb },
        caption: message,
        contextInfo: newsletterContext,
      },
      { quoted: mek }
    );

  } catch (error) {
    console.error(error);
    await conn.sendMessage(
      from,
      { text: `❎ An error occurred: ${error.message}`, contextInfo: newsletterContext },
      { quoted: mek }
    );
  }
});