const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "igstalk",
  react: "📸",
  desc: "Stalk an Instagram profile",
  category: "tools",
  filename: __filename
}, 
async (conn, mek, m, { from, args }) => {
  try {
    if (!args.length) {
      return await conn.sendMessage(from, {
        text: "📌 Usage: *!igstalk [username]*\nExample: !igstalk giftedtechnexus"
      }, { quoted: mek });
    }

    const username = args[0];
    const apiUrl = `https://api.giftedtech.co.ke/api/stalk/igstalk?apikey=gifted_api_6kuv56877d&username=${encodeURIComponent(username)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.success || !data.result) {
      return await conn.sendMessage(from, {
        text: `❌ No profile found for @${username}`
      }, { quoted: mek });
    }

    const {
      profilePicUrl,
      username: uname,
      name,
      bio,
      posts,
      followers,
      following
    } = data.result;

    const caption = `🔍 *Instagram Stalk*\n\n` +
                    `👤 *Name:* ${name}\n` +
                    `🔖 *Username:* @${uname}\n` +
                    `📄 *Bio:* ${bio || "None"}\n\n` +
                    `📸 *Posts:* ${posts}\n` +
                    `👥 *Followers:* ${followers}\n` +
                    `➡️ *Following:* ${following}`;

    await conn.sendMessage(from, {
      image: { url: profilePicUrl },
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363422794491778@newsletter',
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
          serverMessageId: 145
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error("❌ IGStalk error:", error.message);
    await conn.sendMessage(from, {
      text: `❌ Error: ${error.message}`
    }, { quoted: mek });
  }
});