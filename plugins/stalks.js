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
        if (!q) return reply("❌ *Please provide a TikTok username!*\nExample: `.tiktokstalk davido`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/tiktokStalk?q=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.status || !data?.data?.user) {
            return reply("❌ *No TikTok profile found. Please check the username!*");
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
                newsletterJid: '120363292876277898@newsletter',
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

        await conn.sendMessage(
            from,
            { text: tiktokInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("TikTok Stalk Error:", e);
        reply("❌ *Error fetching TikTok profile:* " + e.message);
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
        if (!q) return reply("❌ *Please provide a WhatsApp Channel URL!*\nExample: `.wachannel https://www.whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // encodeURIComponent to safely include URL param
        const url = `https://apis.davidcyriltech.my.id/stalk/wa?url=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.title) {
            return reply("❌ *No WhatsApp Channel info found. Please check the URL!*");
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
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 147,
            },
            externalAdReply: {
                title: data.title,
                body: `${data.followers} — WhatsApp Channel`,
                mediaType: 1,
                thumbnailUrl: 'https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg', // WhatsApp logo or use a better image if available
                sourceUrl: q
            }
        };

        await conn.sendMessage(
            from,
            { text: info, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("WhatsApp Channel Stalk Error:", e);
        reply("❌ *Error fetching WhatsApp Channel info:* " + e.message);
    }
});


cmd({
    pattern: "npms",
    alias: ["npmstalk", "npmsearch", "npminfo", "npmpkg", "npmpackage"],
    react: "📦",
    desc: "🔍 Get info about any npm package",
    category: "🕵️ Stalker",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ *Please provide an npm package name!*\nExample: `.npms baileys`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/stalk/npm?query=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();
        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 1000,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363292876277898@newsletter',
                newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
                serverMessageId: 147,
            },
            externalAdReply: {
                title: data.title,
                body: `${data.followers} — WhatsApp Channel`,
                mediaType: 1,
                thumbnailUrl: 'https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg', // WhatsApp logo or use a better image if available
                sourceUrl: q
            }
        };
        
        if (!data?.status) {
            return reply("❌ *No npm package found with that name!* Please check and try again.");
        }

        const latestVersion = data.latestVersion || 'N/A';
        const lastModified = data.lastModified ? new Date(data.lastModified).toDateString() : 'N/A';
        const homepage = data.homepage || 'N/A';
        const repository = data.repository || 'N/A';
        const description = data.description || 'N/A';
        const keywords = Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords.join(", ") : "N/A";

        // Prepare download links for last 5 versions if available
        let versionsInfo = "";
        if (Array.isArray(data.versions) && data.versions.length > 0) {
            const lastVersions = data.versions.slice(-5);
            versionsInfo = lastVersions.map(v => `• ${v.version}: ${v.download}`).join("\n");
        } else {
            versionsInfo = "No version info available.";
        }

        const npmInfo = `
*📦 npm Package Info*

*📛 Name:* ${data.name}
*📝 Description:* ${description}
*🔑 Keywords:* ${keywords}
*🆕 Latest Version:* ${latestVersion}
*📅 Last Modified:* ${lastModified}

*🏠 Homepage:* ${homepage}
*🔗 Repository:* ${repository}

*📥 Recent Downloads:*
${versionsInfo}

🔰 *𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐*`;

        await conn.sendMessage(
            from,
            { text: npmInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("npm Stalk Error:", e);
        reply("❌ *Error fetching npm package info:* " + e.message);
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
        if (!q) return reply("❌ *Please provide an Instagram username!*\nExample: `.igstalk mrbeast`");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const url = `https://apis.davidcyriltech.my.id/igstalk?username=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.usrname) {
            return reply("❌ *No Instagram profile found. Please check the username!*");
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
                newsletterJid: '120363292876277898@newsletter',
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

        await conn.sendMessage(
            from,
            { text: igInfo, contextInfo: newsletterContext },
            { quoted: mek }
        );

    } catch (e) {
        console.error("Instagram Stalk Error:", e);
        reply("❌ *Error fetching Instagram profile:* " + e.message);
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
        if (!q) return reply("❌ *Enter format:* `username|type`\n🔹 Example: ```.tgstalk hanstech0|channel \n.tgstalk randomuser123|user\n.tgstalk newsupdatesgroup|group ```");

        const [username, type] = q.split("|").map(v => v.trim());

        if (!username || !type || !["user", "group", "channel"].includes(type.toLowerCase())) {
            return reply("❌ *Invalid format or type.*\n📌 Usage: `username|type`\n💡 Types: `user`, `group`, `channel`");
        }

        const api = `https://itzpire.com/stalk/telegram?username=${encodeURIComponent(username)}&type=${type.toLowerCase()}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json || json.status !== "success") {
            return reply("🚫 *Failed to fetch Telegram info.* Make sure the username exists and is public.");
        }

        const { title, subscribers, description, image } = json.data;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
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

        await conn.sendMessage(
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
        reply("⚠️ *Something went wrong while fetching Telegram profile.*");
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
        if (!q) return reply("❌ *Enter a valid Twitter/X username.*\n🔹 Example: `elonmusk`");

        const api = `https://itzpire.com/stalk/twitter?username=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const json = await res.json();

        if (!json || json.status !== "success" || json.data.not_found) {
            return reply("🚫 *User not found or request failed.*");
        }

        const data = json.data;
        const user = data.user;

        const newsletterContext = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363292876277898@newsletter",
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

        await conn.sendMessage(
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
        reply("⚠️ *Error while fetching Twitter data.* Please try again later.");
    }
});
