const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { exec } = require("child_process");

// Ensure temp folder exists
const tempDir = path.join(__dirname, "./temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// 1. toimg - sticker to image
cmd({
  pattern: "toimg",
  react: "🖼️",
  desc: "Convert sticker to image",
  category: "converter",
  use: ".toimg",
  filename: __filename,
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    
    if (!quoted.msg || !quoted.msg.mimetype.includes("webp")) {
      return safeReply(conn, mek.key.remoteJid, "🌻 Please reply to a sticker.");
    } 

    const stickerBuffer = await quoted.download();
    const inputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
    const outputPath = path.join(tempDir, `sticker_${Date.now()}.png`);
    fs.writeFileSync(inputPath, stickerBuffer);

    await sharp(inputPath)
      .png()
      .toFile(outputPath);

    await safeSend(conn, from, { image: fs.readFileSync(outputPath), caption: "*Converted to Image ✅*" }, { quoted: mek });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    safeReply(conn, mek.key.remoteJid, "❌ Failed to convert sticker to image.");
  }
});

// 2. togif - video to GIF
cmd({
  pattern: "togif",
  react: "🎞️",
  desc: "Convert video to GIF",
  category: "converter",
  use: ".togif",
  filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted.msg || !quoted.msg.mimetype.startsWith("video")) {
      return safeReply(conn, mek.key.remoteJid, "🌻 Please reply to a video.");
    }

    const videoBuffer = await quoted.download();
    const inputPath = path.join(tempDir, `video_${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `video_${Date.now()}.gif`);
    fs.writeFileSync(inputPath, videoBuffer);

    // Convert to GIF using ffmpeg
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${inputPath}" -vf "fps=15,scale=320:-1:flags=lanczos" "${outputPath}"`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await safeSend(conn, from, { video: fs.readFileSync(outputPath), caption: "*Converted to GIF ✅*" }, { quoted: mek });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    safeReply(conn, mek.key.remoteJid, "❌ Failed to convert video to GIF.");
  }
});

// 3. tostick - media to sticker
cmd({
  pattern: "tostick",
  react: "🎴",
  desc: "Convert media to sticker",
  category: "converter",
  use: ".tostick",
  filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted.msg || (!quoted.msg.mimetype.startsWith("image") && !quoted.msg.mimetype.startsWith("video"))) {
      return safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image or video.");
    }

    const mediaBuffer = await quoted.download();
    const inputPath = path.join(tempDir, `media_${Date.now()}.${quoted.msg.mimetype.startsWith("image") ? "png" : "mp4"}`);
    const outputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
    fs.writeFileSync(inputPath, mediaBuffer);

    if (quoted.msg.mimetype.startsWith("image")) {
      await sharp(inputPath)
        .webp({ quality: 100 })
        .toFile(outputPath);
    } else {
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${inputPath}" -vcodec libwebp -filter:v "fps=fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 1 -loop 0 -preset default "${outputPath}"`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await safeSend(conn, from, { sticker: fs.readFileSync(outputPath) }, { quoted: mek });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    safeReply(conn, mek.key.remoteJid, "❌ Failed to convert media to sticker.");
  }
});

// 4. vv - view-once media
cmd({
  pattern: "tovv",
  react: "👁️",
  desc: "Send media as view once",
  category: "utility",
  use: ".vv",
  filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
  try {
    const quoted = mek.quoted ? mek.quoted : mek;
    if (!quoted.msg || (!quoted.msg.mimetype.startsWith("image") && !quoted.msg.mimetype.startsWith("video"))) {
      return safeReply(conn, mek.key.remoteJid, "🌻 Please reply to an image or video.");
    }

    const mediaBuffer = await quoted.download();
    const mediaType = quoted.msg.mimetype.startsWith("image") ? "image" : "video";

    await safeSend(conn, from, {
      [mediaType]: mediaBuffer,
      viewOnce: true,
      caption: "*Sent as View Once 👁️*"
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    safeReply(conn, mek.key.remoteJid, "❌ Failed to send media as view once.");
  }
});

