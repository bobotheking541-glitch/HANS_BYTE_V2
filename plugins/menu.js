const { cmd } = require('../command');
const os = require('os');
const config = require('../config');
const { runtime } = require('../lib/functions');

// RAM usage bar
function ramUsageBar() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const percent = Math.round((used / total) * 100);

  const bars = 10;
  const filled = Math.round((percent / 100) * bars);
  const bar = "█".repeat(filled) + "░".repeat(bars - filled);

  return `[${bar}] ${percent}%`;
}

// Split menu into chunks
function getMenuChunks(prefix) {
  return [
    `┌─═✦🖥️ CORE ✦═─┐
│${prefix}menu
│${prefix}setprefix
│${prefix}setenv
│${prefix}readenv
│${prefix}env
│${prefix}ping
│${prefix}repo
│${prefix}system
└──────────≫`,

    `┌─═✦🤖 AI ✦═─┐
│${prefix}gemini
│${prefix}claude
│${prefix}dalle
│${prefix}deepseek
│${prefix}mistral
│${prefix}vision
│${prefix}lmgpt
│${prefix}aicheck
└──────────≫`,

    `┌─═✦📥 DOWNLOADER ✦═─┐
│${prefix}apk
│${prefix}ytmp3
│${prefix}ytmp4
│${prefix}play
│${prefix}download
│${prefix}fbdl
│${prefix}gitclone
│${prefix}gdrive
│${prefix}insta
│${prefix}tikdl
│${prefix}xdl
│${prefix}snackdl
│${prefix}spotify
└──────────≫`,

    `┌─═✦🎮 GAMES ✦═─┐
│${prefix}quiz
│${prefix}riddle
│${prefix}typegame
│${prefix}matchme
│${prefix}roll
│${prefix}coinflip
└──────────≫`,

    `┌─═✦😄 FUN ✦═─┐
│${prefix}lovecheck
│${prefix}jokes
│${prefix}quote
│${prefix}pickupline
│${prefix}advice
│${prefix}meme
│${prefix}waifu
│${prefix}pokedex
└──────────≫`,

    `┌─═✦🛠️ TOOLS ✦═─┐
│${prefix}savestatus
│${prefix}randomwalpp
│${prefix}calculate
│${prefix}reverse
│${prefix}define
│${prefix}currency
│${prefix}time
│${prefix}date
│${prefix}qrcode
│${prefix}barcode
│${prefix}qrread
│${prefix}bcread
│${prefix}shorten
└──────────≫`,

    `┌─═✦👥 GROUP MGMT ✦═─┐
│${prefix}setname
│${prefix}setdesc
│${prefix}promote
│${prefix}demote
│${prefix}mute
│${prefix}unmute
│${prefix}lock
│${prefix}unlock
│${prefix}add
│${prefix}leave
│${prefix}tagall
│${prefix}del
│${prefix}welcome
│${prefix}getlink
│${prefix}revokelink
│${prefix}admins
│${prefix}ginfo
│${prefix}hidetag
│${prefix}tagadmins
│${prefix}setwelcome
│${prefix}antilink
└──────────≫`,

    `┌─═✦🌐 SEARCH ✦═─┐
│${prefix}google
│${prefix}wikimedia
│${prefix}gifsearch
│${prefix}img
│${prefix}wallpaper
│${prefix}happymod
└──────────≫`,

    `┌─═✦🕵️ STALK ✦═─┐
│${prefix}ipstalk
│${prefix}gitstalk
│${prefix}ttstalk
│${prefix}igstalk
│${prefix}wastalk
│${prefix}npmstalk
│${prefix}tgstalk
└──────────≫`,

    `┌─═✦🎨 MEDIA ✦═─┐
│${prefix}emojimix
│${prefix}emoji
│${prefix}ephoto
│${prefix}toimg
│${prefix}tostick
│${prefix}togif
│${prefix}tovv
│${prefix}story
└──────────≫`,

    `┌─═✦📚 UTILITIES ✦═─┐
│${prefix}bible
│${prefix}book
│${prefix}calender
│${prefix}version
│${prefix}country
│${prefix}capcut
│${prefix}couplepp
│${prefix}bbc
│${prefix}fetch
│${prefix}rcolor
│${prefix}shapar
│${prefix}count
│${prefix}pair
│${prefix}ghibli
│${prefix}obfuscate
│${prefix}ssweb
│${prefix}saveweb
│${prefix}ccgen
│${prefix}soundcloud
│${prefix}facebook
│${prefix}gofile
│${prefix}tourl
│${prefix}vcf
│${prefix}proxy
│${prefix}animequote
│${prefix}tempmail
│${prefix}inbox
│${prefix}readmail
│${prefix}cleanuri
│${prefix}vurl
│${prefix}curl
│${prefix}wget
└──────────≫`
  ];
}

cmd({
  pattern: "menu",
  alias: ["help", "commands"],
  react: "📜",
  desc: "Show bot menu",
  category: "general",
  filename: __filename
}, async (conn, m, args, { from, sender, pushname }) => {
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const platform = process.platform;
  const uptime = runtime(process.uptime());

  const intro = `┌─═✦🖥️ ${config.BOT_NAME} ✦═─┐
│⚡ User: ${pushname || 'User'}
│⌚ Time: ${time}
│📆 Date: ${date}
│💾 RAM: ${ramUsageBar()}
│🧠 Platform: ${platform}
│📊 Uptime: ${uptime}
│👑 Owner: ${config.OWNER_NAME || 'Unknown'}
│📦 Version : *2.0.0*
└───────✦✧✦──────≫`;

  const menuChunks = getMenuChunks(config.PREFIX);

  // Combine intro + menu chunks + footer into one message
  const footer = `╰─≫ *HANS BYTE V2*`;
  const finalMenu = [intro, ...menuChunks, footer].join("\n\n");

  await conn.sendMessage(from, {
    image: { url: "https://files.catbox.moe/kzqia3.jpeg" },
    caption: finalMenu + "\n\n🌐 Join our WA channel: https://whatsapp.com/channel/0029Vb6F9V9FHWpsqWq1CF14",
    footer: "HANS BYTE V2 • By Hans Tech",
    headerType: 4 // image
  }, { quoted: m });
});
