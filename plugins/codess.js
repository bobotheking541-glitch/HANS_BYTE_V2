const { cmd } = require('../command');
const BWIPJS = require('bwip-js');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');


cmd({
    pattern: "barcode",
    alias: ["bc", "genbarcode"],
    react: "🔖",
    desc: "🖤 Generate a barcode from text",
    category: "🛠 Utility",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please enter the text to generate a barcode.*");

        // Generate barcode buffer
        const buffer = await BWIPJS.toBuffer({
            bcid: 'code128',       // Barcode type
            text: q,               // Text to encode
            scale: 3,              // 3x scaling factor
            height: 10,            // Bar height, in mm
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Align text to center
        });

        // Save to temp file
        const tempFile = path.join(__dirname, './temp/barcode.png');
        fs.writeFileSync(tempFile, buffer);

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 300,
            },
            externalAdReply: {
                title: "HANS BYTE MD",
                body: "BY HANS TECH",
                mediaType: 2,
                thumbnailUrl: "https://i.ibb.co/5s7H4sM/barcode.png", // optional placeholder
                showAdAttribution: true,
                sourceUrl: "https://hansbtt.com"
            }
        };

        const caption = `
╭━[     *BARCODE GENERATED*    ]━╮
┃ 🔹 *Text:* ${q}
┃ 🖤 *Type:* Code128
┃ 🧊 *Status:* Generated successfully
╰━━━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send barcode image with caption and context
        await safeSend(conn, 
            from,
            {
                image: { url: tempFile },
                caption,
                contextInfo
            },
            { quoted: mek }
        );

        // Delete temp file after sending
        fs.unlinkSync(tempFile);

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *Failed to generate barcode.*\nPlease make sure the text is valid.");
    }
});



cmd({
    pattern: "qrcode",
    alias: ["qr", "genqr"],
    react: "🟦",
    desc: "🖤 Generate a QR code from text or URL",
    category: "🛠 Utility",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please enter the text or URL to generate a QR code.*");

        // Generate QR code buffer
        const buffer = await QRCode.toBuffer(q, {
            errorCorrectionLevel: 'H',
            type: 'png',
            margin: 2,
            scale: 8
        });

        // Save to temp file
        const tempFile = path.join(__dirname, './temp/qrcode.png');
        fs.writeFileSync(tempFile, buffer);

        const contextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 301,
            },
            externalAdReply: {
                title: "HANS BYTE MD",
                body: "BY HANS TECH",
                mediaType: 2,
                thumbnailUrl: "https://files.catbox.moe/kzqia3.jpeg", // optional placeholder
                showAdAttribution: true,
                sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
            }
        };

        const caption = `
╭━[     *QR CODE GENERATED*    ]━╮
┃ 🔹 *Text/URL:* ${q}
┃ 🖤 *Type:* QR Code
┃ 🧊 *Status:* Generated successfully
╰━━━━━━━━━━━━━━━━━━━━╯

🚀 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        // Send QR code image
        await safeSend(conn, 
            from,
            {
                image: { url: tempFile },
                caption,
                contextInfo
            },
            { quoted: mek }
        );

        // Delete temp file after sending
        fs.unlinkSync(tempFile);

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *Failed to generate QR code.*\nPlease make sure the text or URL is valid.");
    }
});
