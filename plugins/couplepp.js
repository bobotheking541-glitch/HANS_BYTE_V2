const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');

// Newsletter context information
const newsletterContext = {
  mentionedJid: [],
  forwardingScore: 1000,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363422794491778@newsletter', // Example newsletter JID
    newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 2",
    serverMessageId: 143,
  },
};

// Register the command
cmd(
  {
    pattern: "couplepp",
    alias: ["couple-pic", "couplepic", "coupleppic", "cpp"],
    desc: "Fetch a couple's profile pictures.",
    use: '.couplepp',
    react: "💑",
    category: "fun",
    filename: __filename,
  },
  async (
    conn,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      // Fetch data from the API
      const response = await fetchJson('https://apis.davidcyriltech.my.id/couplepp');
      
      const { male, female } = response;

      // Prepare message with images
      const caption = "BY HANS BYTE MD";

      // Send the male and female images with newsletter context (forwarded)
      const sentMsg = await safeSend(conn, 
        from,
        {
          image: { url: male },
          caption: `*Male Profile Pic* \n\n${caption}`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

      // Send the female image with newsletter context (forwarded)
      await safeSend(conn, 
        from,
        {
          image: { url: female },
          caption: `*Female Profile Pic* \n\n${caption}`,
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error("Error in couplepp command:", e);
      await safeSend(conn, 
        from,
        { text: `❎ Error occurred: ${e.message || e}`, contextInfo: newsletterContext },
        { quoted: mek }
      );
    }
  }
);