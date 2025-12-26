const config = require('../config');
const { cmd, commands } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set the ffmpeg path so fluent-ffmpeg can use it.
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Helper function that converts a GIF buffer into an animated WebP sticker buffer.
 * It writes the GIF to a temporary file, converts it using fluent-ffmpeg, and then reads
 * the resulting WebP file into a buffer. Temporary files are cleaned up afterward.
 *
 * @param {Buffer} gifBuffer - The GIF data as a buffer.
 * @returns {Promise<Buffer>} - Resolves with the animated WebP sticker buffer.
 */
async function convertGifToWebpSticker(gifBuffer) {
  return new Promise((resolve, reject) => {
    // Create unique temporary file names.
    const timestamp = Date.now();
    const inputPath = path.join(__dirname, `input_${timestamp}.gif`);
    const outputPath = path.join(__dirname, `output_${timestamp}.webp`);

    // Write the GIF buffer to disk.
    fs.writeFileSync(inputPath, gifBuffer);

    // Use fluent-ffmpeg to convert the GIF to WebP.
    ffmpeg(inputPath)
      .outputOptions([
        '-vcodec libwebp',
        // Adjust the following filter_complex options as needed.
        '-filter_complex', "[0:v] fps=15,scale=512:512:flags=lanczos,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
        '-loop 0',
        '-preset default',
        '-an',
        '-vsync 0'
      ])
      .on('end', () => {
        try {
          const stickerBuffer = fs.readFileSync(outputPath);
          // Clean up temporary files.
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
          resolve(stickerBuffer);
        } catch (readError) {
          reject(readError);
        }
      })
      .on('error', (err) => {
        // Clean up the input file; output file might not exist.
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Command: .gifsearch (alias: .giphy)
 * Searches Giphy for GIFs matching the provided search term, converts them into animated
 * WhatsApp stickers, and sends them to the user.
 */
cmd({
  pattern: "gif",
  react: "🎬",
  alias: ["giphy"],
  desc: "Searches for GIFs on Giphy and sends them as WhatsApp animated stickers (Powered by HANS BYTE MD)",
  category: "tools",
  use: ".gifsearch <search term>",
  filename: __filename
}, async (conn, mek, m, { args, reply, sender }) => {
  console.log("---------------------------------------------------");
  console.log(`[INFO] Command '.gif' invoked by ${sender}`);
  console.log(`[INFO] Timestamp: ${new Date().toISOString()}`);

  // Verify that a search term was provided.
  if (!args || args.length === 0) {
    return safeReply(conn, mek.key.remoteJid, "❌ Please provide a search term.\nUsage: .gif <search term>");
  }
  const query = args.join(" ");
  // Randomly select a limit between 2 and 6.
  const limit = Math.floor(Math.random() * 5) + 2;
  const apiKey = "OFEMsaoLDGEImsSioDSgGGHCYIh8Tybh";
  const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=0&rating=G&lang=en`;

  try {
    console.log(`[DEBUG] Searching for GIFs with query: "${query}" (limit: ${limit})`);
    const response = await fetch(giphyUrl);
    const json = await response.json();
    console.log("[DEBUG] Giphy API response received:", json);

    if (!json.data || json.data.length === 0) {
      return safeReply(conn, mek.key.remoteJid, "❌ No GIFs found for your search term.");
    }

    // Process each GIF result.
    for (let i = 0; i < json.data.length; i++) {
      const gif = json.data[i];
      // Choose the fixed_height version URL.
      const gifUrl = gif.images.fixed_height.url;
      console.log(`[DEBUG] Processing GIF ${i + 1} of ${json.data.length}: ${gifUrl}`);

      // Download the GIF as a buffer.
      const gifResponse = await fetch(gifUrl);
      const gifBuffer = await gifResponse.buffer();

      try {
        // Convert the GIF to an animated WebP sticker buffer.
        const stickerBuffer = await convertGifToWebpSticker(gifBuffer);
        console.log(`[DEBUG] Sending sticker ${i + 1}`);
        // Send the sticker using your connection's sendMessage method.
        // Adjust the method if your bot library uses a different method to send stickers.
        await safeSend(conn, m.chat, { sticker: stickerBuffer }, { quoted: m });
      } catch (conversionError) {
        console.error(`[ERROR] Conversion failed for GIF ${i + 1}:`, conversionError);
        safeReply(conn, mek.key.remoteJid, `❌ Failed to convert GIF ${i + 1} to sticker.`);
      }
    }
  } catch (error) {
    console.error("[ERROR] Exception in gifsearch command:", error);
    return safeReply(conn, mek.key.remoteJid, "❌ An error occurred while searching for GIFs. Please try again later.\n\nPowered by HANS BYTE MD");
  }
});

cmd({
  pattern: "attp",
  desc: "Convert text to a GIF sticker.",
  react: "🪀",
  category: "convert",
  use: ".attp HI",
  filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
  try {
      if (!args.length) return safeReply(conn, mek.key.remoteJid, "*Please provide text!*");

      const text = args.join(" ");
      const styledText = stylishText(text);

      // API call with proper URL encoding
      const gifBuffer = await fetchGif(`https://api.nexoracle.com/image-creating/attp?apikey=2f9b02060a600d6c88&text=${encodeURIComponent(styledText)}`);
      const stickerBuffer = await gifToSticker(gifBuffer);

      await safeSend(conn, m.chat, { sticker: stickerBuffer }, { quoted: mek });
  } catch (error) {
      safeReply(conn, mek.key.remoteJid, `❌ ${error.message}`);
  }
});