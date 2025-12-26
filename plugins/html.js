const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');

cmd({
    pattern: "html",
    alias: ["generatehtml", "htmlgen"],
    desc: "Autonomously generate futuristic HTML sites using Hans Tech AI",
    category: "🤖 AI",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a website prompt (e.g., 'portfolio', 'tech landing page', etc.)");

        console.log("\n🧠 [HansTech AI] Generating stylish HTML autonomously...\n");

        const prompt = `
You are HansTech AI, a futuristic web designer.
Your goal: create a **visually stunning HTML5 site** that matches the user's request.
It must be sleek, colorful, smooth, and futuristic with rounded corners, smooth fonts, gradients, and slight animation.

ALWAYS return JSON in this exact structure:
{
  "type": "html",
  "html": "<html>...</html>",
  "needs_image_search": true | false,
  "search_query": "string | null"
}

Rules:
- If the site benefits from images, set "needs_image_search": true and define "search_query".
- The HTML must be **standalone** — include <head>, <meta>, <style>, and <body>.
- Style with **modern gradients, smooth shadows, hover effects**, and a **dark or neon color palette**.
- Use Google Fonts (like 'Poppins' or 'Inter') for futuristic feel.
- Include a placeholder <div id="image-section"></div> where images should appear.
- NEVER include markdown, explanation, or anything outside the JSON.

User request: "${q}"
        `;

        // Step 1: Query HansTech AI
        const aiRes = await fetch(`https://hanstech-api.zone.id/api/qwen-coder?prompt=${encodeURIComponent(prompt)}&key=hans~UfvyXEb`);
        const aiJson = await aiRes.json();

        if (!aiJson.response) return safeReply(conn, mek.key.remoteJid, "🚫 AI returned no response. Try again.");

        let raw = aiJson.response.trim();
        console.log("📥 Raw AI Output:\n", raw);

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error("⚠️ Invalid AI JSON format:\n", raw);
            return safeReply(conn, mek.key.remoteJid, "⚠️ Invalid AI response format.");
        }

        let finalHTML = parsed.html;

        // Step 2: If AI requested image search
        if (parsed.needs_image_search && parsed.search_query) {
            console.log(`🔍 Performing image search for: "${parsed.search_query}"`);
            const imgAPI = `https://hanstech-api.zone.id/api/image-search?query=${encodeURIComponent(parsed.search_query)}&key=hans~UfvyXEb`;
            const imgRes = await fetch(imgAPI);
            const imgJson = await imgRes.json();

            if (imgJson.status === "success" && imgJson.images?.length > 0) {
                const selected = imgJson.images.slice(0, 3).map(img => img.original).filter(Boolean);

                // Create a grid-style image section
                const imgHTML = `
<div class="image-grid">
${selected.map(url => `<img src="${url}" alt="${parsed.search_query}" class="ai-image">`).join('\n')}
</div>`;

                // Try to insert images into placeholder or main section
                if (finalHTML.includes('<div id="image-section"></div>')) {
                    finalHTML = finalHTML.replace('<div id="image-section"></div>', imgHTML);
                } else if (/<main>/i.test(finalHTML)) {
                    finalHTML = finalHTML.replace(/<main>/i, `<main>\n${imgHTML}`);
                } else if (/<body>/i.test(finalHTML)) {
                    finalHTML = finalHTML.replace(/<body>/i, `<body>\n${imgHTML}`);
                } else {
                    finalHTML += `\n${imgHTML}`;
                }

                // Add responsive, futuristic styling for image grid
                if (finalHTML.includes("</style>")) {
                    finalHTML = finalHTML.replace("</style>", `
.image-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin: 40px 0;
}
.ai-image {
  width: 320px;
  height: auto;
  border-radius: 15px;
  margin: 10px;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.35);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.ai-image:hover {
  transform: scale(1.07);
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
}
</style>`);
                }
            } else {
                console.log("🚫 No suitable images found.");
            }
        }

        // Step 3: Save HTML file
        const fileName = `HansTech_${Date.now()}.html`;
        fs.writeFileSync(fileName, finalHTML, 'utf8');
        console.log(`💾 HTML file saved as: ${fileName}`);

        // Step 4: Send file to WhatsApp
        await safeSend(conn, 
            from,
            {
                document: fs.readFileSync(fileName),
                mimetype: 'text/html',
                fileName: fileName,
                caption: "🚀 *Stylish futuristic site generated by Hans Tech AI!*",
                contextInfo: {
                    externalAdReply: {
                        title: "Hans Byte 2",
                        body: "BY HANS TECH",
                        mediaType: 2,
                        thumbnailUrl: 'https://files.catbox.moe/kzqia3.jpeg',
                        sourceUrl: "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
                    }
                }
            },
            { quoted: mek }
        );

        console.log("✅ File sent successfully!");

    } catch (err) {
        console.error("💥 Error in HTML generation:", err);
        safeReply(conn, mek.key.remoteJid, "⚠️ Something went wrong while generating the HTML.");
    }
});
