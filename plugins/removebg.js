const { cmd } = require("../command");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");

cmd({
  pattern: "rmbg",
  alias: ["removebg", "bgless"],
  react: "🎨",
  desc: "Remove background from an image",
  category: "utility",
  use: ".rmbg",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q, sender }) => {
  try {
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (!mimeType || !mimeType.startsWith("image")) {
      return await reply("🌻 Please reply to an image.");
    }

    // Download the image
    const imageBuffer = await quotedMsg.download();
    const tempImagePath = path.join(os.tmpdir(), "temp_image");
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Upload to imgbb to get a temporary URL
    const form = new FormData();
    form.append("image", fs.createReadStream(tempImagePath));
    const imgbbResponse = await axios.post("https://api.imgbb.com/1/upload?key=f342084918d24b0c0e18bd4bf8c8594e", form, {
      headers: { ...form.getHeaders() },
    });

    if (!imgbbResponse.data?.data?.url) {
      throw "❌ Failed to upload the file.";
    }

    const imageUrl = imgbbResponse.data.data.url;
    const removeBgUrl = `https://apis.davidcyriltech.my.id/removebg?url=${encodeURIComponent(imageUrl)}`;

    // Custom contextInfo
    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363292876277898@newsletter",
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
        serverMessageId: 200,
      },
      externalAdReply: {
        title: `HANS BYTE MD`,
        body: `BY HANS TECH`,
        mediaType: 2,
        thumbnailUrl: "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg",
        showAdAttribution: true,
        sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
      }
    };

    await conn.sendMessage(from, {
      image: { url: removeBgUrl },
      caption: "*Background Removed Successfully 🎨*",
      contextInfo,
    }, { quoted: mek });

    fs.unlinkSync(tempImagePath);
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing your request. Please try again later.");
  }
});
