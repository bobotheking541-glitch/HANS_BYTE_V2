const { cmd } = require('../command');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

cmd({
    pattern: "gitclone",
    alias: ["clone"],
    react: "📂",
    desc: "🔗 Clone a GitHub repo & send as ZIP",
    category: "💻 Developer",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, sender }) => {
    try {
        if (!q)
            return safeReply(conn, mek.key.remoteJid, "❌ *Please provide a GitHub repository URL!* ❌\n\n🔹 *Example:* `.gitclone https://github.com/user/repo.git`");

        if (!q.startsWith("https://github.com/"))
            return safeReply(conn, mek.key.remoteJid, "🚫 *Invalid GitHub link!* 🚫");

        // Determine repository name & paths
        let repoName = q.split('/').pop().replace('.git', '');
        let reposDir = path.join(__dirname, 'repos');
        if (!fs.existsSync(reposDir)) {
            fs.mkdirSync(reposDir, { recursive: true });
            console.log(`Created directory: ${reposDir}`);
        }
        let repoPath = path.join(reposDir, repoName);
        let zipPath = `${repoPath}.zip`;

        // If the repository folder already exists, remove it to avoid conflicts
        if (fs.existsSync(repoPath)) {
            console.log(`Repository directory ${repoPath} already exists. Removing it.`);
            fs.rmSync(repoPath, { recursive: true, force: true });
        }

        safeReply(conn, mek.key.remoteJid, `🔄 *Cloning Repository...* 📂\n\n📌 *Repo:* ${q}`);

        exec(`git clone ${q} ${repoPath}`, async (error, stdout, stderr) => {
            if (error) {
                console.error("Error cloning repo:", error);
                return safeReply(conn, mek.key.remoteJid, `🚨 *Error cloning repo!* 🚨\n\n📝 ${error.message}`);
            }
            // Sometimes, stderr might include non-critical messages. Log them for debugging.
            if (stderr && stderr.trim()) {
                console.warn("Stderr while cloning repo:", stderr);
            }
            console.log("Repository cloned successfully.");
            safeReply(conn, mek.key.remoteJid, "📦 *Creating ZIP file...* 🔄");

            try {
                // Create a write stream for the ZIP file
                let output = fs.createWriteStream(zipPath);
                let archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', async () => {
                    console.log(`ZIP file ${zipPath} created. Total bytes: ${archive.pointer()}`);
                    safeReply(conn, mek.key.remoteJid, "✅ *Repository cloned & zipped successfully!* 🎉");

                    // Create newsletter context info
                    const newsletterContext = {
                        mentionedJid: [sender],
                        forwardingScore: 1000,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363422794491778@newsletter',
                            newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝐌𝐃",
                            serverMessageId: 143,
                        },
                    };

                    // Send the zip file with the newsletter context
                    await safeSend(conn, from, { 
                        document: fs.readFileSync(zipPath), 
                        mimetype: 'application/zip',
                        fileName: `${repoName}.zip`,
                        caption: `🗂️ *Here is the ZIP file of ${repoName}*\n\n🔗 *Cloned from:* ${q}\n\n🛠️ *Powered by HANS BYTE MD*`,
                        contextInfo: newsletterContext
                    }, { quoted: mek });

                    // Cleanup the cloned repository and the zip file
                    try {
                        if (fs.existsSync(repoPath)) {
                            fs.rmSync(repoPath, { recursive: true, force: true });
                        }
                        if (fs.existsSync(zipPath)) {
                            fs.unlinkSync(zipPath);
                        }
                        console.log("Cleanup completed: Removed cloned repo and zip file.");
                    } catch (cleanupError) {
                        console.error("Error during cleanup:", cleanupError);
                    }
                });

                archive.on('error', err => {
                    console.error("Archiver error:", err);
                    return safeReply(conn, mek.key.remoteJid, `🚨 *Error creating ZIP file:* ${err.message} 🚨`);
                });

                archive.pipe(output);
                archive.directory(repoPath, false);
                archive.finalize();

            } catch (zipError) {
                console.error("Error during ZIP creation:", zipError);
                safeReply(conn, mek.key.remoteJid, `🚨 *Error creating ZIP file:* ${zipError.message} 🚨`);
            }
        });

    } catch (e) {
        console.error("Unexpected error:", e);
        safeReply(conn, mek.key.remoteJid, `🚨 *An unexpected error occurred:* ${e.message} 🚨`);
    }
});