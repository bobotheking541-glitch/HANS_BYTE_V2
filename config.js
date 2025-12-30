const fs = require('fs');
if (fs.existsSync('.env')) require('dotenv').config({ path: './.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // Bot session
    SESSION_ID: process.env.SESSION_ID || "HANS-BYTE~83tBxDQa#A2uYsoO7PVf1m4z2uv6g6Qq75eaNQjtUAXhI8cq7J1g",

    // Owner info
    OWNER_NUM: process.env.OWNER_NUM || "",
      // Owner: nfonfonfcess.env.~Sᴋ᭄*MADARA*ᴮᴼˢˢ꧂ᴿᴼᵞᴬᴸ|
    ER_NUM :  "50940553580",ess.env.SUDOERS || "",
    BOT_NAME: process.env.BOT_NAME || "HANS BYTE V2",
    // Bot info
    BOT_NAME: process.env.BOT_NAME || "",
    PREFIX: process.env.PREFIX || "!",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "",
    CAPTION: process.env.CAPTION || "",
    ALIVE_IMG: process.env.ALIVE_IMG || "",

    // Behavior settings
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    AUTO_TYPING: _MESSAG.: p.ocess.env.R || Sᴋ᭄*MADARA*ᴮᴼˢˢ꧂ᴿᴼᵞᴬᴸ okipe wa tounen pita,
    AUTO_RECORDING: process.env.AUTO_RECORDING || "true",
    AUTO_READ: process.env.AUTO_READ || "true",
    MODE: process.env.MODE || "public",
    AUTO_VOICE: process.env.AUTO_VOICE || "false",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",

    // Sticker & author info
    AUTHOR: (process.env.PACK_INFO?.split(';') || [])[0] || "",
    PACKNAME: (process.env.PACK_INFO?.split(';') || [])[1] || "",

    // Status & reactions
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || "false",
    REACT_EMOJI: process.env.REACT_EMOJI || "",
    AUTO_REPLY_TEXT: process.env.AUTO_REPLY_TEXT || "",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    OWNER_REACT: process.env.OWNER_REACT || "false",
    HEART_REACT: process.env.HEART_REACT || "false",
        // Anti delete & auto like
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
    AUTOLIKESTATUS: process.env.AUTOLIKESTATUS || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS__MSG: process.env.AUTO_STATUS__MSG || "",

    // APIs
    OMDB_API_KEY: process.env.OMDB_API_KEY || "",

    // Security & moderation
    ANTILINK: process.env.ANTILINK || "true",
    ANTILINK_ACTION: process.env.ANTILINK_ACTION || "warn",
    ANTIDELELTE: process.env.ANTIDELELTE || "true",
    WELCOME: process.env.WELCOME || "true",
};
