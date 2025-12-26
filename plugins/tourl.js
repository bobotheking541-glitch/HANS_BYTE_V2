const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const FormData = require("form-data");
const { cmd } = require("../command");

cmd({
  pattern: "tourl",
  alias: ["imgtourl", "img2url", "url"],
  react: '🖇',
  desc: "Convert an image to a URL using Catbox.moe",
  category: "utility",
  use: ".tourl",
  filename: __filename
}, async (conn, msg, m, extra) => {
  const { from, quoted, reply, sender } = extra;

  try {
    const messageToProcess = msg.quoted || msg;

    const mimeType =
      messageToProcess.mimetype ||
      messageToProcess.msg?.mimetype ||
      messageToProcess.message?.imageMessage?.mimetype ||
      "";

    if (!mimeType.startsWith("image/")) {
      return safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image.");
    }

    

    // Download image
    const imageBuffer = await messageToProcess.download();

    // Save temp file in ./temp folder
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const extension = mimeType.split("/")[1] || "jpg";
    const tempFilePath = path.join(tempDir, `img_${Date.now()}.${extension}`);
    fs.writeFileSync(tempFilePath, imageBuffer);

    console.log("Temporary file saved at:", tempFilePath);

    // Upload to Catbox
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempFilePath));

    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    if (!response.data || !response.data.startsWith("http")) {
      throw "❌ Failed to upload the image.";
    }

    const imageUrl = response.data.trim();

    const contextInfo = {
      mentionedJid: [sender],
      forwardingScore: 1000,
      isForwarded: true
    };

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: `*Image Uploaded Successfully 📸*\nSize: ${imageBuffer.length} Byte(s)\n*URL:* ${imageUrl}\n\n> ⚖️ Uploaded via 𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃`,
      contextInfo
    });

  } catch (err) {
    safeReply(conn, mek.key.remoteJid, "Error: " + err);
    console.error("Error occurred:", err);
  }
});
