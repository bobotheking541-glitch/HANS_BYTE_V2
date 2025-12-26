const { cmd } = require("../command");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");

const RMBG_API_KEY = "X9GEXiipkgwcrVax6cxzjDrf";

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
      return await safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image.");
    }

    // Download image
    const imageBuffer = await quotedMsg.download();

    // Create temp file path
    const tempImagePath = path.join(os.tmpdir(), `temp_image_${Date.now()}.png`);
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Prepare form-data for remove.bg
    const form = new FormData();
    form.append("image_file", fs.createReadStream(tempImagePath));
    form.append("size", "auto");

    // Call remove.bg API
    const rmbgResponse = await axios.post("https://api.remove.bg/v1.0/removebg", form, {
      headers: {
        ...form.getHeaders(),
        "X-Api-Key": RMBG_API_KEY,
      },
      responseType: "arraybuffer",
    });

    // Send result directly as buffer
    await safeSend(conn, from, {
      image: rmbgResponse.data,
      caption: "*Background Removed Successfully 🎨*",
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
          serverMessageId: 200,
        },
        externalAdReply: {
          title: `HANS BYTE MD`,
          body: `BY HANS TECH`,
          mediaType: 2,
          thumbnailUrl: "https://files.catbox.moe/kzqia3.jpeg",
          showAdAttribution: true,
          sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O",
        },
      },
    }, { quoted: mek });

    // Cleanup temp file
    if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);

  } catch (error) {
    console.error(error.response?.data || error);
    safeReply(conn, mek.key.remoteJid, "❌ An error occurred while removing the background. Please try again later.");
  }
});
