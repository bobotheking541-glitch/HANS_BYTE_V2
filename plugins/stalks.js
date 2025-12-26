const { cmd } = require('../command');
const fetch = require('node-fetch');
const channelurl = "https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O";


cmd({
    pattern: "tiktokstalk",
    alias: ["ttstalk"],
    react: "🎵",
    desc: "🔍 Stalk any TikTok user profile",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide a TikTok username!*\nExample: `.tiktokstalk davido`");

        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/tiktokStalk?q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.status || !data?.data?.user) {
            return safeReply(conn, mek.key.remoteJid, "❌ *No TikTok profile found. Please check the username!*");
        }

        const user = data.data.user;
        const stats = data.data.stats;

        const tiktokInfo = `
*🎵 TikTok Profile Stalker*

*👤 Username:* ${user.uniqueId || 'N/A'}
*🆔 User ID:* ${user.id}
*📛 Nickname:* ${user.nickname || 'N/A'}
*✔️ Verified:* ${user.verified ? 'Yes' : 'No'}
*📝 Bio:* ${user.signature || 'N/A'}
*🌐 Bio Link:* ${user.bioLink?.link || 'N/A'}

*👥 Followers:* ${stats.followerCount.toLocaleString()}
*➡️ Following:* ${stats.followingCount.toLocaleString()}
*❤️ Likes:* ${stats.heartCount.toLocaleString()}
*🎥 Videos:* ${stats.videoCount.toLocaleString()}

*🔗 Profile:* https://www.tiktok.com/@${user.uniqueId}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 146,
            },
            externalAdReply: {
                title: "🎵 TikTok Stalker",
                body: `👤 ${user.uniqueId} — Profile Stats`,
                mediaType: 1,
                thumbnailUrl: user.avatarLarger,
                sourceUrl: channelurl
            }
        };

        await safeSend(conn, 
            from,
            { text: tiktokInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("TikTok Stalk Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error fetching TikTok profile:* " + e.message);
    }
});

cmd({
    pattern: "wachannel",
    alias: ["wastalk", "wachanstalk"],
    react: "📢",
    desc: "🔍 Stalk any WhatsApp Channel info",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide a WhatsApp Channel URL!*\nExample: `.wachannel https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O`");

        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        // encodeURIComponent to safely include URL param
        const url = `https://apis.davidcyriltech.my.id/stalk/wa?url=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.title) {
            return safeReply(conn, mek.key.remoteJid, "❌ *No WhatsApp Channel info found. Please check the URL!*");
        }

        const info = `
*📢 WhatsApp Channel Info*

*📛 Title:* ${data.title}
*👥 Followers:* ${data.followers}
*📄 Description:*
${data.description}

🔗 Channel URL: ${q}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 147,
            },
            externalAdReply: {
                title: data.title,
                body: `${data.followers} — WhatsApp Channel`,
                mediaType: 1,
                thumbnailUrl: 'https://files.catbox.moe/kzqia3.jpeg', // WhatsApp logo or use a better image if available
                sourceUrl: q
            }
        };

        await safeSend(conn, 
            from,
            { text: info, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("WhatsApp Channel Stalk Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error fetching WhatsApp Channel info:* " + e.message);
    }
});




cmd({
    pattern: "npm",
    alias: ["npms", "npmsearch"],
    react: "📦",
    desc: "Search for an NPM package",
    category: "📁 Tools",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a package name. Example: npm @whiskeysockets/baileys");

        const pkg = encodeURIComponent(q);
        const apiUrl = `https://hanstech-api.zone.id/api/npm-stalker?package=${pkg}&key=hans%7EUfvyXEb`;

        const res = await fetch(apiUrl, { method: 'GET' });
        const data = await res.json();

        if (!data || data.status === 'error' || !data.name) {
            console.error('NPM stalker error:', data);
            return safeReply(conn, mek.key.remoteJid, "❌ Package not found or API error.");
        }

        // adapt fields depending on what Hans Tech returns
        const name = data.name || q;
        const version = data.version || data['dist-tags']?.latest || "N/A";
        const description = data.description || "No description";
        const homepage = data.homepage || (data.repository && (data.repository.url || data.repository)) || "N/A";
        const repository = (data.repository && (data.repository.url || data.repository)) || "N/A";
        const license = data.license || "N/A";
        const author = (data.author && (data.author.name || data.author)) || (data.maintainers ? data.maintainers.map(m=>m.name).join(", ") : "N/A");
        const created = (data.time && data.time.created) || (data.time && data.time['created']) || "N/A";
        const modified = (data.time && data.time.modified) || (data.time && data.time['modified']) || "N/A";
        const npmLink = data.links?.npm || `https://www.npmjs.com/package/${encodeURIComponent(name)}`;
        const homepageOrRepo = homepage !== "N/A" ? homepage : repository;

        const msg = `
╭━[   *NPM PACKAGE INFO*   ]━╮
┃ 🔹 *Name:* ${name}
┃ 📝 *Description:* ${description}
┃ 📦 *Version:* ${version}
┃ 👤 *Author/Maintainers:* ${author}
┃ 📅 *Created:* ${created}
┃ ✏️ *Last Modified:* ${modified}
┃ 🏷️ *License:* ${license}
┃ 🌐 *Homepage / Repo:* ${homepageOrRepo}
┃ 🔗 *NPM:* ${npmLink}
╰━━━━━━━━━━━━━━━━━━━━╯
`.trim();

        safeReply(conn, mek.key.remoteJid, msg);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error fetching package info.");
    }
});



cmd({
    pattern: "igstalk",
    alias: ["instastalk", "instagramstalk", "igprofile", "iginfo"],
    react: "📸",
    desc: "🔍 Stalk any Instagram user profile",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Please provide an Instagram username!*\nExample: `.igstalk mrbeast`");

        await safeSend(conn, from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/igstalk?username=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.usrname) {
            return safeReply(conn, mek.key.remoteJid, "❌ *No Instagram profile found. Please check the username!*");
        }

        const igInfo = `
*📸 Instagram Profile Stalker*

*👤 Username:* ${data.usrname}
*📝 Bio:* ${data.desk || "N/A"}

*📷 Posts:* ${data.status.post}
*👥 Followers:* ${data.status.follower}
*➡️ Following:* ${data.status.following}

🔗 Profile: https://instagram.com/${data.usrname}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422794491778@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 148,
            },
            externalAdReply: {
                title: `${data.usrname} — Instagram Profile`,
                body: `${data.status.follower} followers`,
                mediaType: 1,
                thumbnailUrl: data.pp,
                sourceUrl: `https://instagram.com/${data.usrname}`
            }
        };

        await safeSend(conn, 
            from,
            { text: igInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Instagram Stalk Error:", e);
        safeReply(conn, mek.key.remoteJid, "❌ *Error fetching Instagram profile:* " + e.message);
    }
});


cmd({
    pattern: "tgstalk",
    alias: ["telegram", "tgcheck"],
    react: "🔍",
    desc: "🕵️ Stalk Telegram users, groups, or channels",
    category: "🛰️ Stalker",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Enter format:* `username|type`\n🔹 Example: ```.tgstalk hanstech0|channel \n.tgstalk randomuser123|user\n.tgstalk newsupdatesgroup|group ```");

        const [username, type] = q.split("|").map(v => v.trim());

        if (!username || !type || !["user", "group", "channel"].includes(type.toLowerCase())) {
            return safeReply(conn, mek.key.remoteJid, "❌ *Invalid format or type.*\n📌 Usage: `username|type`\n💡 Types: `user`, `group`, `channel`");
        }

        const api = `https://itzpire.com/stalk/telegram?username=${encodeURIComponent(username)}&type=${type.toLowerCase()}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json || json.status !== "success") {
            return safeReply(conn, mek.key.remoteJid, "🚫 *Failed to fetch Telegram info.* Make sure the username exists and is public.");
        }

        const { title, subscribers, description, image } = json.data;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 404
            },
            externalAdReply: {
                title: `🔍 Telegram ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                body: `${title} • ${subscribers || "N/A"}`,
                thumbnailUrl: image,
                mediaType: 2,
                showAdAttribution: true,
                sourceUrl: `https://t.me/${username}`
            }
        };

        const caption = `
╭━━━[ *𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 𝐒𝐓𝐀𝐋𝐊* ]━━━╮
┃ 🔎 *Username:* @${username}
┃ 📛 *Title:* ${title || "N/A"}
┃ 👥 *Members:* ${subscribers || "Hidden"}
┃ 📝 *Type:* ${type}
┃ 📖 *About:* ${description || "No bio"}
╰━━━━━━━━━━━━━━━━━━━━━━╯

📡 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        await safeSend(conn, 
            from,
            {
                image: { url: image },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *Something went wrong while fetching Telegram profile.*");
    }
});


cmd({
    pattern: "twstalk",
    alias: ["twitterstalk", "xstalk"],
    react: "👁️",
    desc: "🕵️ Stalk Twitter/X users and view their status",
    category: "🛰️ Stalker",
    filename: __filename
}, async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ *Enter a valid Twitter/X username.*\n🔹 Example: `elonmusk`");

        const api = `https://itzpire.com/stalk/twitter?username=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json || json.status !== "success" || json.data.not_found) {
            return safeReply(conn, mek.key.remoteJid, "🚫 *User not found or request failed.*");
        }

        const data = json.data;
        const user = data.user;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363422794491778@newsletter",
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 505
            },
            externalAdReply: {
                title: `👁️ Twitter/X Stalker`,
                body: `${user.name} • ${user.followers_count.toLocaleString()} followers`,
                mediaType: 2,
                thumbnailUrl: user.profile_image_url_https,
                showAdAttribution: true,
                sourceUrl: `https://x.com/${user.screen_name}`
            }
        };

        const caption = `
╭━━━[ *𝐓𝐖𝐈𝐓𝐓𝐄𝐑 / 𝐗 𝐒𝐓𝐀𝐋𝐊* ]━━━╮
┃ 👤 *Name:* ${user.name}
┃ 🧬 *Username:* @${user.screen_name}
┃ 📊 *Followers:* ${user.followers_count.toLocaleString()}
┃ 🤝 *Following:* ${user.friends_count}
┃ 🧠 *ID:* ${user.id}
┃ 🔒 *Protected:* ${data.protect ? "Yes" : "No"}
┃ 👻 *Ghost Banned:* ${data.ghost_ban ? "Yes" : "No"}
┃ 🚫 *Search Banned:* ${data.search_ban ? "Yes" : "No"}
┃ 💬 *Reply Deboosted:* ${data.reply_deboosting ? "Yes" : "No"}
┃ ⚠️ *Suspended:* ${data.suspend ? "Yes" : "No"}
╰━━━━━━━━━━━━━━━━━━━━━━╯

🐦 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*
`.trim();

        await safeSend(conn, 
            from,
            {
                image: { url: user.profile_image_url_https },
                caption,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "⚠️ *Error while fetching Twitter data.* Please try again later.");
    }
});
