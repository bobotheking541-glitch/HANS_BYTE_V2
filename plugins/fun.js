const { cmd } = require('../command');
const axios = require('axios');

// Helper function for safe replies
async function safeReply(conn, jid, text, options = {}) {
  try {
    return await conn.sendMessage(jid, { text, ...options });
  } catch (error) {
    console.error("Safe reply error:", error);
  }
}

// Helper function for safe sends
async function safeSend(conn, jid, content, options = {}) {
  try {
    return await conn.sendMessage(jid, content, options);
  } catch (error) {
    console.error("Safe send error:", error);
  }
}

// Helper function to fetch JSON
async function fetchJson(url) {
  const response = await axios.get(url);
  return response.data;
}

// ===== QUIZ COMMAND =====
cmd({
  pattern: "quiz",
  react: "❓",
  desc: "Start a random trivia quiz",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, {}) => {
  try {
    console.log("===== QUIZ DEBUG START =====");
    console.log("Chat ID:", mek.key.remoteJid);

    // Mark message as read
    await conn.readMessages([mek.key]);
    console.log("Marked message as read.");

    // Fetch trivia question
    const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = res.data.results[0];

    // Decode HTML entities
    const decodeHTML = (html) => {
      return html
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    };

    const question = decodeHTML(data.question);
    const correct = decodeHTML(data.correct_answer);
    const allAnswers = [...data.incorrect_answers.map(decodeHTML), correct]
      .sort(() => Math.random() - 0.5);
    const answerIndex = allAnswers.findIndex(ans => ans === correct) + 1;

    console.log("Fetched question:", question);
    console.log("All answers:", allAnswers);
    console.log("Correct answer index:", answerIndex);

    // Send question
    await conn.sendMessage(
      mek.key.remoteJid,
      {
        text:
          `🧠 *Trivia Time!*\n\n` +
          `❓ ${question}\n\n` +
          allAnswers.map((a, i) => `*${i + 1}.* ${a}`).join("\n") +
          `\n\n_Reply with the correct option number (1-${allAnswers.length}) within *10 seconds*_`
      }
    );

    // Wait for answer - FIXED TIMEOUT
    const filter = m => m.key.fromMe === false && m.message?.conversation;
    const timeout = 10000; // 10 seconds in milliseconds

    console.log("Waiting for user response...");
    
    // Create a promise-based timeout handler
    const waitForAnswer = new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => resolve(null), timeout);
      
      // Listen for messages
      const messageHandler = (msg) => {
        if (msg.key.remoteJid === mek.key.remoteJid && 
            !msg.key.fromMe && 
            msg.message?.conversation) {
          clearTimeout(timeoutId);
          conn.ev.off('messages.upsert', messageHandler);
          resolve(msg);
        }
      };
      
      conn.ev.on('messages.upsert', ({ messages }) => {
        messageHandler(messages[0]);
      });
    });

    const collected = await waitForAnswer;

    if (!collected) {
      console.log("Time's up - no answer received");
      return await safeReply(conn, mek.key.remoteJid, "⏱️ Time's up! You didn't answer in time.");
    }

    const userAnswer = parseInt(collected.message.conversation.trim());

    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > allAnswers.length) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Invalid answer format. Use the number of the correct choice.");
    }

    if (userAnswer === answerIndex) {
      return await safeReply(conn, mek.key.remoteJid, "✅ *Correct!* You're a quiz master! 🎉");
    } else {
      return await safeReply(conn, mek.key.remoteJid, `❌ *Wrong!* The correct answer was: *${answerIndex}. ${correct}*`);
    }

  } catch (err) {
    console.error("QUIZ ERROR:", err);
    await safeReply(conn, mek.key.remoteJid, "❌ Could not fetch quiz question. Try again later.");
  } finally {
    console.log("===== QUIZ DEBUG END =====");
  }
});

// ===== RIDDLE COMMAND =====
cmd({
  pattern: "riddle",
  react: "🧠",
  desc: "Sends a brain-teasing riddle",
  category: "fun",
  use: ".riddle",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const { data } = await axios.get("https://riddles-api.vercel.app/random");
    await safeReply(conn, mek.key.remoteJid, `🧩 *Riddle:* ${data.riddle}\n\n💡 *Answer:* ||${data.answer}||`);
  } catch (e) {
    console.error(e);
    await safeReply(conn, mek.key.remoteJid, "❌ Could not fetch a riddle.");
  }
});

// ===== TYPING SPEED GAME =====
cmd({
  pattern: "typegame",
  react: "⌨️",
  desc: "Speed typing mini game",
  category: "fun",
  use: ".typegame",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const query = "Generate a challenging sentence for a typing speed game. It should be at least 20 words long, use diverse vocabulary, and be grammatically correct. Output only the sentence, no explanation.";

    const res = await axios.get(`https://apis.davidcyriltech.my.id/ai/chatbot`, {
      params: { query }
    });

    const sentence = res.data?.result?.trim()?.replace(/\n/g, " ");

    if (!sentence || sentence.split(" ").length < 10) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to get a valid sentence. Try again.");
    }

    await safeReply(conn, mek.key.remoteJid, `⌨️ *Typing Speed Challenge!*\n\nType this sentence exactly as shown below:\n\n"${sentence}"\n\n⏱️ _You have 20 seconds!_`);

    const startTime = Date.now();
    const timeout = 20000; // 20 seconds

    // Wait for response
    const waitForResponse = new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), timeout);
      
      const messageHandler = (msg) => {
        if (msg.key.remoteJid === mek.key.remoteJid && 
            !msg.key.fromMe && 
            msg.message?.conversation) {
          clearTimeout(timeoutId);
          conn.ev.off('messages.upsert', messageHandler);
          resolve(msg);
        }
      };
      
      conn.ev.on('messages.upsert', ({ messages }) => {
        messageHandler(messages[0]);
      });
    });

    const collected = await waitForResponse;

    if (!collected) {
      return await safeReply(conn, mek.key.remoteJid, "⏱️ Time's up! You didn't answer in time.");
    }

    const userInput = collected.message.conversation.trim();
    const endTime = Date.now();

    if (userInput !== sentence) {
      return await safeReply(conn, mek.key.remoteJid, "❌ You typed it incorrectly. Better luck next time!");
    }

    const timeTaken = (endTime - startTime) / 1000;
    const words = sentence.split(" ").length;
    const wpm = Math.round((words / timeTaken) * 60);

    await safeReply(conn, mek.key.remoteJid, `✅ *Correct!*\n🕒 Time: ${timeTaken.toFixed(2)} seconds\n📈 Speed: ${wpm} WPM\n🔥 Sentence Length: ${words} words`);
  } catch (e) {
    console.error("TypeGame Error:", e?.response?.data || e.message);
    await safeReply(conn, mek.key.remoteJid, "⚠️ Failed to start the typing game. Please try again later.");
  }
});

// ===== LOVE CHECK COMMAND =====
cmd({
  pattern: "lovecheck",
  react: "❤️",
  desc: "Fun love % between two users",
  category: "fun",
  use: ".lovecheck <@user>",
  filename: __filename
}, async (conn, mek, m, { reply, sender }) => {
  const mentionedUser = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mentionedUser) {
    return await safeReply(conn, mek.key.remoteJid, "❌ Please mention a user to check love compatibility.\nExample: .lovecheck @user");
  }

  const love = Math.floor(Math.random() * 101);
  await safeReply(conn, mek.key.remoteJid, `💕 Love compatibility between *${sender.split("@")[0]}* and *${mentionedUser.split("@")[0]}*: *${love}%*`);
});

// ===== MATCH ME COMMAND =====
cmd({
  pattern: "matchme",
  react: "🤝",
  desc: "Randomly pair 2 members in the group",
  category: "fun",
  use: ".matchme",
  filename: __filename
}, async (conn, mek, m, { reply, groupMetadata }) => {
  if (!groupMetadata) {
    return await safeReply(conn, mek.key.remoteJid, "❌ This command can only be used in groups.");
  }

  const participants = groupMetadata.participants.map(p => p.id);
  if (participants.length < 2) {
    return await safeReply(conn, mek.key.remoteJid, "❌ Not enough members to match.");
  }

  const pick = () => participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
  const a = pick();
  const b = pick();

  const aUser = a.split("@")[0];
  const bUser = b.split("@")[0];

  await safeReply(conn, mek.key.remoteJid, `🤝 *Match Made!*\n\n@${aUser} ❤️ @${bUser}`, {
    mentions: [a, b]
  });
});

// ===== REVERSE TEXT COMMAND =====
cmd({
  pattern: "reverse",
  react: "🔄",
  desc: "Replies with the reversed text",
  category: "fun",
  use: ".reverse <text>",
  filename: __filename
}, async (conn, mek, m, { reply, args }) => {
  const input = args.join(" ");
  if (!input) {
    return await safeReply(conn, mek.key.remoteJid, "❗️ Please provide text to reverse.\nExample: .reverse hello world");
  }
  await safeReply(conn, mek.key.remoteJid, input.split("").reverse().join(""));
});

// ===== JOKES COMMAND =====
cmd({
  pattern: "jokes",
  desc: "Fetch a random joke",
  category: "fun",
  react: "😂",
  filename: __filename
}, async (conn, mek, m, { reply, sender, from }) => {
  try {
    let res = await fetchJson("https://official-joke-api.appspot.com/random_joke");
    let imageUrl = "https://files.catbox.moe/wdi4cg.jpeg";

    if (res && res.setup && res.punchline) {
      const jokeMessage = `😂 *Joke of the Day* 😂\n\n${res.setup}\n\n👉 ${res.punchline}`;

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

      await safeSend(conn, from, {
        image: { url: imageUrl },
        caption: jokeMessage,
        contextInfo: newsletterContext,
      }, { quoted: mek });
    } else {
      return await safeReply(conn, mek.key.remoteJid, "❌ Couldn't fetch a joke at the moment. Try again later!");
    }
  } catch (e) {
    console.error(e);
    return await safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message || e}`);
  }
});

// ===== QUOTE COMMAND =====
cmd({
  pattern: "quote",
  desc: "Get a random motivational quote.",
  category: "other",
  react: "💡",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const response = await axios.get('https://apis.davidcyriltech.my.id/random/quotes');
    const data = response.data;
    let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

    if (!data.success) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch a quote. Please try again.");
    }

    const quoteMessage = `💬 *Quote of the Day* 💬\n\n_"${data.response.quote}"_\n\n- *${data.response.author}*`;

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

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: quoteMessage,
      contextInfo: newsletterContext,
    }, { quoted: mek });
  } catch (error) {
    console.error("Error fetching quote:", error);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
  }
});

// ===== PICKUP LINE COMMAND =====
cmd({
  pattern: "pickupline",
  desc: "Get a random pick-up line.",
  category: "other",
  react: "💘",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const response = await axios.get('https://apis.davidcyriltech.my.id/pickupline');
    const data = response.data;
    let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

    if (!data.success) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch a pick-up line. Please try again.");
    }

    const quoteMessage = `💘 *PICKUP LINE of the Day* 💘\n\n_"${data.pickupline}"_\n\n`;

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

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: quoteMessage,
      contextInfo: newsletterContext,
    }, { quoted: mek });
  } catch (error) {
    console.error("Error fetching pick-up line:", error);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
  }
});

// ===== ADVICE COMMAND =====
cmd({
  pattern: "advice",
  desc: "Get a random advice.",
  category: "other",
  react: "💡",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const response = await axios.get('https://api.giftedtech.co.ke/api/fun/advice?apikey=gifted_api_6kuv56877d');
    const data = response.data;
    let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

    if (!data.success) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch advice. Please try again.");
    }

    const quoteMessage = `💬 *Advice of the Day* 💬\n\n_"${data.result}"_\n\n`;

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

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: quoteMessage,
      contextInfo: newsletterContext,
    }, { quoted: mek });
  } catch (error) {
    console.error("Error fetching advice:", error);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
  }
});

// ===== GOOD NIGHT COMMAND =====
cmd({
  pattern: "goodnight",
  desc: "Send a random good night message.",
  category: "other",
  react: "🌙",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const response = await axios.get('https://api.giftedtech.co.ke/api/fun/goodnight?apikey=gifted_api_6kuv56877d');
    const data = response.data;
    let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

    if (!data.success) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch good night wishes. Please try again.");
    }

    const quoteMessage = `🌌 *Good Night Wishes* 🌌\n\n_"${data.result}"_\n\n`;

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

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: quoteMessage,
      contextInfo: newsletterContext,
    }, { quoted: mek });
  } catch (error) {
    console.error("Error fetching good night message:", error);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
  }
});

// ===== MOTIVATION COMMAND =====
cmd({
  pattern: "motivation",
  desc: "Get a motivational quote.",
  category: "other",
  react: "🔥",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  try {
    const response = await axios.get('https://api.giftedtech.co.ke/api/fun/motivation?apikey=gifted_api_6kuv56877d');
    const data = response.data;
    let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

    if (!data.success) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch motivation quote. Please try again.");
    }

    const quoteMessage = `💪 *Motivational Quote* 💪\n\n_"${data.result}"_\n\n`;

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

    await safeSend(conn, from, {
      image: { url: imageUrl },
      caption: quoteMessage,
      contextInfo: newsletterContext,
    }, { quoted: mek });
  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    await safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
  }
});

// ===== CHAR QUOTE COMMAND =====
cmd({
  pattern: "charquote",
  alias: ["animequote", "quotechar"],
  react: "📝",
  desc: "Get an anime character quote",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply, args }) => {
  try {
    const q = args.join(" ");
    if (!q) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Please provide a character name.\nExample: .charquote light yagami");
    }

    const character = encodeURIComponent(q);
    const res = await fetch(`https://api.giftedtech.co.ke/api/anime/char-quotes?apikey=gifted_api_6kuv56877d&character=${character}`);
    const data = await res.json();

    if (!data.success || !data.result) {
      return await safeReply(conn, mek.key.remoteJid, "❌ Could not fetch quote for this character.");
    }

    const msg = `
╭━[   *ANIME CHARACTER QUOTE*   ]━╮
┃ 🔹 *Character:* ${data.result.character}
┃ 🎬 *Show:* ${data.result.show}
┃ 💬 *Quote:* "${data.result.quote}"
┃ 🧊 *Status:* Fetched successfully!
╰━━━━━━━━━━━━━━━━━━━━╯
`;

    await safeReply(conn, mek.key.remoteJid, msg);
  } catch (err) {
    console.error(err);
    await safeReply(conn, mek.key.remoteJid, "❌ Error fetching the quote.");
  }
});