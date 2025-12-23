const { cmd } = require("../command");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");

cmd({
  pattern: "vision",
  alias: ["aiimg", "describeimg"],
  react: "🖼️",
  desc: "Describe an image using Mistral Vision AI",
  category: "💬 AI",
  use: ".vision [prompt or URL]",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q, pushname, sender }) => {
  try {
    let imageUrl;
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (!mimeType || !mimeType.startsWith("image")) {
      if (q && q.match(/^https?:\/\//i)) {
        imageUrl = q;
        q = "";
      } else return await reply("❌ Please reply to an image or provide a valid image URL.");
    } else {
      const imageBuffer = await quotedMsg.download();

      // Save temp file
      const tempDir = path.join(__dirname, "temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const extension = mimeType.split("/")[1] || "png";
      const tempImagePath = path.join(tempDir, `temp_image_${Date.now()}.${extension}`);
      fs.writeFileSync(tempImagePath, imageBuffer);

      // Upload to Catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(tempImagePath));

      try {
        const catboxRes = await axios.post("https://catbox.moe/user/api.php", form, {
          headers: form.getHeaders(),
        });

        imageUrl = catboxRes.data?.trim();
        if (!imageUrl || !imageUrl.startsWith("http")) throw new Error("Catbox did not return a valid URL.");
      } catch (catErr) {
        console.error("Catbox Upload Error:", catErr.response?.data || catErr);
        return reply("❌ Failed to upload image to Catbox. Check console for details.");
      } finally {
        fs.existsSync(tempImagePath) && fs.unlinkSync(tempImagePath);
      }
    }

    const prompt = q
      ? `Hello I am ${pushname} : ${q}`
      : "Carefully observe the image and provide a detailed description. Include all visible objects, their positions, colors, textures, and interactions. Describe the overall atmosphere, mood, and any emotions the scene conveys. Mention lighting, shadows, perspective, and any notable background or environmental elements.";

    try {
      const apiUrl = `https://api.giftedtech.co.ke/api/ai/vision?apikey=gifted_api_6kuv56877d&url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl);
      console.log("Mistral API Response:", res.status, res.data);

      const json = res.data;
      if (!json?.success || !json?.result) {
        console.error("Mistral API returned invalid data:", json);
        return reply("⚠️ Failed to get description from Mistral Vision AI. Check console for details.");
      }

      await conn.sendMessage(from, {
        text: `💡 *Mistral Vision AI Description:*\n\n${json.result}`,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363422794491778@newsletter",
            newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
            serverMessageId: 500,
          },
          externalAdReply: {
            title: `HANS BYTE MD`,
            body: `BY HANS TECH`,
            mediaType: 2,
            thumbnailUrl: imageUrl,
            showAdAttribution: true,
            sourceUrl: imageUrl,
          },
        },
      }, { quoted: mek });
    } catch (apiErr) {
      console.error("Mistral Vision API Error:", apiErr.response?.data || apiErr);
      return reply("❌ Error calling Mistral Vision API. Check console for details.");
    }

  } catch (err) {
    console.error("General Error:", err.response?.data || err);
    reply("❌ An unexpected error occurred. Check console for details.");
  }
});
