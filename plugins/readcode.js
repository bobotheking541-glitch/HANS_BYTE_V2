const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const jsQR = require("jsqr");
const { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } = require("@zxing/library");


// Ensure temp folder exists
if (!fs.existsSync(path.join(__dirname, "./temp"))) {
    fs.mkdirSync(path.join(__dirname, "./temp"));
}

cmd({
  pattern: "readcode",
  alias: ["qrread", "barcoderead"],
  react: "🔍",
  desc: "Read QR code or Barcode from an image",
  category: "utility",
  use: ".readcode",
  filename: __filename,
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (!mimeType || !mimeType.startsWith("image")) {
      return await safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image containing a QR code or barcode.");
    }

    // Download image
    const imageBuffer = await quotedMsg.download();

    // Create temp file path in ./temp
    const tempImagePath = path.join(__dirname, "./temp/temp_image_" + Date.now() + ".png");
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Read image with Jimp
    const image = await Jimp.read(tempImagePath);
    const { data, width, height } = image.bitmap;

    // Try to read QR code
    const qrCode = jsQR(new Uint8ClampedArray(data), width, height);

    let resultText = "";

    if (qrCode) {
      resultText = `
╭━[     *QR CODE GENERATED*    ]━╮
┃ 🔹 *Text/URL:* ${qrCode.data}
┃ 🖤 *Type:* QR Code
┃ 🧊 *Status:* Generated successfully
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();
    } else {
      resultText = "❌ No QR code detected in the image.";
    }

    // Send result
    await safeSend(conn, from, {
      text: resultText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
          serverMessageId: 201,
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
    console.error(error);
    safeReply(conn, mek.key.remoteJid, "❌ An error occurred while reading the code. Please try again later.");
  }
});

if (!fs.existsSync(path.join(__dirname, "./temp"))) {
    fs.mkdirSync(path.join(__dirname, "./temp"));
}

cmd({
  pattern: "readbarcode",
  alias: ["barcoderead", "bcread"],
  react: "📦",
  desc: "Read a barcode from an image",
  category: "utility",
  use: ".readbarcode",
  filename: __filename,
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const quotedMsg = mek.quoted ? mek.quoted : mek;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (!mimeType || !mimeType.startsWith("image")) {
      return await safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image containing a barcode.");
    }

    // Download image
    const imageBuffer = await quotedMsg.download();

    // Create temp file path in ./temp
    const tempImagePath = path.join(__dirname, "./temp/temp_barcode_" + Date.now() + ".png");
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Read image with Jimp
    const image = await Jimp.read(tempImagePath);
    const { data, width, height } = image.bitmap;

    // Convert Jimp image to grayscale Uint8ClampedArray
    const grayData = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) << 2;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        grayData[y * width + x] = (0.299 * r + 0.587 * g + 0.114 * b);
      }
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
    const reader = new BrowserMultiFormatReader(hints);

    let resultText = "";

    try {
      const luminanceSource = new reader.LuminanceSource(grayData, width, height);
      const binaryBitmap = new reader.BinaryBitmap(luminanceSource);
      const result = reader.decode(binaryBitmap);
      resultText = `
╭━[     *BARCODE GENERATED*    ]━╮
┃ 🔹 *Code:* ${result.getText()}
┃ 🖤 *Type:* ${result.getBarcodeFormat()}
┃ 🧊 *Status:* Generated successfully
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();
    } catch {
      resultText = "❌ No barcode detected in the image.";
    }

    // Send result
    await safeSend(conn, from, {
      text: resultText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
          serverMessageId: 202,
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
    console.error(error);
    safeReply(conn, mek.key.remoteJid, "❌ An error occurred while reading the barcode. Please try again later.");
  }
});