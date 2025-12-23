const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "UukETbrb#s0rSQ2lSD75TTmrw2yFYY0BtNmTiLJHhS2TsH2bMOFU",
    OWNER_NUM: process.env.OWNER_NUM || "237694668970", // your number
    OWNER_NAME: process.env.OWNER_NAME || "HANS TECH",
    BOT_NAME: process.env.BOT_NAME || "HANS BYTE V2",
    SUDO: process.env.SUDO || "237694668970",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    PREFIX: process.env.PREFIX || "!",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🔥,❤️‍🩹,❤️,🩷,🧡,💛,💚,💙,🩵,💜,🤎,🖤,🩶,🤍",
    CAPTION: process.env.CAPTION || "",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    READ_MESSAGE: process.env.READ_MESSAGE || "false", // Added auto-read configuration
    AUTO_TYPING: process.env.AUTO_TYPING || "true",       // string "true" or "false"
    AUTO_RECORDING: process.env.AUTO_RECORDING || "true",
    AUTO_READ: process.env.AUTO_READ || "true",
    MODE: process.env.MODE || "public",
    AUTO_VOICE: process.env.AUTO_VOICE || "false",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTHOR: (process.env.PACK_INFO?.split(';') || [])[0] || 'HANS TECH TEAM',
    PACKNAME: (process.env.PACK_INFO?.split(';') || [])[1] || 'HANS BYTE V2',
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || 'true',
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || 'true',
    AUTO_REPLY_STATUS: process.env.AUTO_REPLY_STATUS || 'false',
    REACT_EMOJI: process.env.REACT_EMOJI || '👍',
    AUTO_REPLY_TEXT: process.env.AUTO_REPLY_TEXT || 'Hello! I have received your status.',
    ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/9gCjCwp/OIG4-E-D0-QOU1r4-Ru-CKuf-Nj0o.jpg",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    OWNER_REACT: process.env.OWNER_REACT || "false",
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log", // change it to 'same' if you want to resend deleted message in same chat
    AUTOLIKESTATUS: process.env.AUTOLIKESTATUS || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS__MSG: process.env.AUTO_STATUS__MSG || "`YOUR STATUS SEEN BY OBITO-MD`",
    OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39", // omdbapi.com
    ANTILINK: "true", // Enables global antilink
    ANTILINK_ACTION: "warn", // options: warn, delete, ban
    ANTIDELELTE: process.env.ANTIDELELTE || "true", // Enables global antidelete
    WELCOME: process.env.WELCOME || "true",
    };
    
