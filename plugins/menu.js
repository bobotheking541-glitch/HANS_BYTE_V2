const os = require("os");
const { cmd, commands } = require("../command");
const config = require("../config");
const { runtime } = require("../lib/functions");

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

cmd(
  {
    pattern: "menu",
    alias: ["getmenu"],
    react: "📔",
    desc: "get cmd list",
    category: "main",
    filename: __filename,
  },
  async (robin, mek, m, { from, sender, pushname, reply }) => {
    try {
      const time = new Date().toLocaleTimeString();
      const date = new Date().toLocaleDateString();
      const platform = process.platform;
      const uptime = runtime(process.uptime());

      let madeMenu = `${pushname}
┌─═✦🖥️ ${config.BOT_NAME} ✦═─┐
│⚡ User: ${pushname}
│⌚ Time: ${time}
│📆 Date: ${date}
│💾 RAM: ${ramUsageBar()}
│🧠 Platform: ${platform}
│📊 Uptime: ${uptime}
│👑 Owner: ${config.OWNER_NAME}
│📦 Version : *2.0.0*
└───────✦✧✦──────≫

┌─═✦🖥️ CORE ✦═─┐
│${config.PREFIX}menu
│${config.PREFIX}setprefix
│${config.PREFIX}setenv
|${config.PREFIX}readenv
│${config.PREFIX}env
│${config.PREFIX}ping
│${config.PREFIX}repo
│${config.PREFIX}menu
│${config.PREFIX}system
└──────────≫

┌─═✦🤖 AI ✦═─┐
│${config.PREFIX}gemini
│${config.PREFIX}claude
│${config.PREFIX}dalle
│${config.PREFIX}deepseek
│${config.PREFIX}mistral
│${config.PREFIX}vision
│${config.PREFIX}lmgpt
│${config.PREFIX}aicheck
└──────────≫

┌─═✦📥 DOWNLOADER ✦═─┐
│${config.PREFIX}apk
|${config.PREFIX}ytmp3
│${config.PREFIX}ytmp4
│${config.PREFIX}play
│${config.PREFIX}download
│${config.PREFIX}fbdl
│${config.PREFIX}gitclone
│${config.PREFIX}gdrive
│${config.PREFIX}insta
│${config.PREFIX}tikdl
│${config.PREFIX}xdl
│${config.PREFIX}snackdl
│${config.PREFIX}spotify
└──────────≫

┌─═✦🎮 GAMES ✦═─┐
│${config.PREFIX}quiz
│${config.PREFIX}riddle
│${config.PREFIX}typegame
│${config.PREFIX}matchme
│${config.PREFIX}roll
│${config.PREFIX}coinflip
└──────────≫

┌─═✦😄 FUN ✦═─┐
│${config.PREFIX}lovecheck
│${config.PREFIX}jokes
│${config.PREFIX}quote
│${config.PREFIX}pickupline
│${config.PREFIX}advice
│${config.PREFIX}meme
│${config.PREFIX}waifu
│${config.PREFIX}pokedex
└──────────≫

┌─═✦🛠️ TOOLS ✦═─┐
│${config.PREFIX}calculate
│${config.PREFIX}reverse
│${config.PREFIX}define
│${config.PREFIX}currency
│${config.PREFIX}time
│${config.PREFIX}date
│${config.PREFIX}qrcode
│${config.PREFIX}barcode
│${config.PREFIX}qrread
│${config.PREFIX}bcread
│${config.PREFIX}shorten
└──────────≫

┌─═✦👥 GROUP MGMT ✦═─┐
│${config.PREFIX}setname
│${config.PREFIX}setdesc
│${config.PREFIX}promote
│${config.PREFIX}demote
│${config.PREFIX}mute
│${config.PREFIX}unmute
│${config.PREFIX}lock
│${config.PREFIX}unlock
│${config.PREFIX}add
│${config.PREFIX}leave
│${config.PREFIX}tagall
│${config.PREFIX}del
│${config.PREFIX}welcome
│${config.PREFIX}getlink
│${config.PREFIX}revokelink
│${config.PREFIX}admins
│${config.PREFIX}ginfo
│${config.PREFIX}hidetag
│${config.PREFIX}tagadmins
│${config.PREFIX}setwelcome
│${config.PREFIX}antilink
└──────────≫

┌─═✦🌐 SEARCH ✦═─┐
│${config.PREFIX}google
│${config.PREFIX}wikimedia
│${config.PREFIX}gifsearch
│${config.PREFIX}img
│${config.PREFIX}wallpaper
│${config.PREFIX}happymod
└──────────≫

┌─═✦🕵️ STALK ✦═─┐
│${config.PREFIX}ipstalk
│${config.PREFIX}gitstalk
│${config.PREFIX}ttstalk
│${config.PREFIX}igstalk
│${config.PREFIX}wastalk
│${config.PREFIX}npmstalk
│${config.PREFIX}tgstalk
└──────────≫

┌─═✦🎨 MEDIA ✦═─┐
│${config.PREFIX}emojimix
│${config.PREFIX}emoji
│${config.PREFIX}ephoto
│${config.PREFIX}toimg
│${config.PREFIX}tostick
│${config.PREFIX}togif
│${config.PREFIX}tovv
│${config.PREFIX}story
└──────────≫

┌─═✦📚 UTILITIES ✦═─┐
│${config.PREFIX}bible
│${config.PREFIX}book
│${config.PREFIX}calender
│${config.PREFIX}version
│${config.PREFIX}country
│${config.PREFIX}capcut
│${config.PREFIX}couplepp
│${config.PREFIX}bbc
│${config.PREFIX}fetch
│${config.PREFIX}rcolor
│${config.PREFIX}shapar
│${config.PREFIX}count
│${config.PREFIX}pair
│${config.PREFIX}ghibli
│${config.PREFIX}obfuscate
│${config.PREFIX}ssweb
│${config.PREFIX}saveweb
│${config.PREFIX}ccgen
│${config.PREFIX}soundcloud
│${config.PREFIX}facebook
│${config.PREFIX}gofile
│${config.PREFIX}tourl
│${config.PREFIX}vcf
│${config.PREFIX}proxy
│${config.PREFIX}animequote
│${config.PREFIX}tempmail
│${config.PREFIX}inbox
│${config.PREFIX}readmail
│${config.PREFIX}cleanuri
│${config.PREFIX}vurl
│${config.PREFIX}curl
│${config.PREFIX}wget
└──────────≫

╰─≫ *HANS BYTE V2*`;

      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 1000,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄",
          serverMessageId: 143,
        },
      };

      await robin.sendMessage(
        from,
        {
          image: { url: "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png" },
          caption: madeMenu,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      safeReply(conn, mek.key.remoteJid, `${e}`);
    }
  }
);
