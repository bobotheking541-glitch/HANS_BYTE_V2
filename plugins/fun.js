const { cmd } = require("../command");
const axios = require("axios");
const config = require("../config");

// Trivia Quiz Command
cmd({
  pattern: "quiz",
  react: "❓",
  desc: "Start a random trivia quiz",
  category: "fun",
  use: ".quiz",
  filename: __filename
}, async (_ctx, msg, _args, { reply, client }) => {
  try {
    const res = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    const data = res.data.results[0];
    const question = data.question;
    const correct = data.correct_answer;
    const allAnswers = [...data.incorrect_answers, correct].sort(() => Math.random() - 0.5);
    const answerIndex = allAnswers.findIndex(ans => ans === correct) + 1;

    await safeReply(conn, mek.key.remoteJid, 
      `🧠 *Trivia Time!*\n\n` +
      `❓ ${question}\n\n` +
      allAnswers.map((a, i) => `*${i + 1}.* ${a}`).join("\n") +
      `\n\n_Reply with the correct option number (1-${allAnswers.length}) within *10 seconds*_`
    );

    const filter = m => m.key.fromMe === false && m.message?.conversation;
    const timeout = 10000;

    const collected = await client.waitForMessage(msg.key.remoteJid, filter, { timeout });

    if (!collected) return safeReply(conn, mek.key.remoteJid, "⏱️ Time's up! You didn't answer in time.");

    const userAnswer = parseInt(collected.message.conversation.trim());

    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > allAnswers.length) {
      return safeReply(conn, mek.key.remoteJid, "❌ Invalid answer format. Use the number of the correct choice.");
    }

    if (userAnswer === answerIndex) {
      return safeReply(conn, mek.key.remoteJid, "✅ *Correct!* You're a quiz master! 🎉");
    } else {
      return safeReply(conn, mek.key.remoteJid, `❌ *Wrong!* The correct answer was: *${answerIndex}. ${correct}*`);
    }
  } catch (err) {
    console.error(err);
    safeReply(conn, mek.key.remoteJid, "❌ Could not fetch quiz question. Try again later.");
  }
});

// Riddle Command
cmd({
  pattern: "riddle",
  react: "🧠",
  desc: "Sends a brain-teasing riddle",
  category: "fun",
  use: ".riddle",
  filename: __filename
}, async (_ctx, _msg, _args, { reply }) => {
  try {
    const { data } = await axios.get("https://riddles-api.vercel.app/random");
    await safeReply(conn, mek.key.remoteJid, `*Riddle:* ${data.riddle}\n*Answer:* ||${data.answer}||`);
  } catch (e) {
    console.error(e);
    safeReply(conn, mek.key.remoteJid, "❌ Could not fetch a riddle.");
  }
});


// Typing Speed Game
cmd({
  pattern: "typegame",
  react: "⌨️",
  desc: "Speed typing mini game",
  category: "fun",
  use: ".typegame",
  filename: __filename
}, async (_ctx, msg, _args, { reply, client }) => {
  try {
    const query = "Generate a challenging sentence for a typing speed game. It should be at least 20 words long, use diverse vocabulary, and be grammatically correct. Output only the sentence, no explanation.";

    const res = await axios.get(`https://apis.davidcyriltech.my.id/ai/chatbot`, {
      params: { query }
    });

    const sentence = res.data?.result?.trim()?.replace(/\n/g, " ");

    if (!sentence || sentence.split(" ").length < 10) {
      return safeReply(conn, mek.key.remoteJid, "❌ Failed to get a valid sentence. Try again.");
    }

    await safeReply(conn, mek.key.remoteJid, `⌨️ *Typing Speed Challenge!*\n\nType this sentence exactly as shown below:\n\n"${sentence}"\n\n⏱️ _You have 20 seconds!_`);

    const startTime = Date.now();

    const filter = m => m.key.fromMe === false && m.message?.conversation;
    const collected = await client.waitForMessage(msg.key.remoteJid, filter, { timeout: 20000 });

    if (!collected) return safeReply(conn, mek.key.remoteJid, "⏱️ Time's up! You didn't answer in time.");

    const userInput = collected.message.conversation.trim();
    const endTime = Date.now();

    if (userInput !== sentence) {
      return safeReply(conn, mek.key.remoteJid, "❌ You typed it incorrectly. Better luck next time!");
    }

    const timeTaken = (endTime - startTime) / 1000;
    const words = sentence.split(" ").length;
    const wpm = Math.round((words / timeTaken) * 60);

    await safeReply(conn, mek.key.remoteJid, `✅ *Correct!*\n🕒 Time: ${timeTaken.toFixed(2)} seconds\n📈 Speed: ${wpm} WPM\n🔥 Sentence Length: ${words} words`);
  } catch (e) {
    console.error("TypeGame Error:", e?.response?.data || e.message);
    safeReply(conn, mek.key.remoteJid, "⚠️ Failed to start the typing game. Please try again later.");
  }
});

// Love Check Command
cmd({
  pattern: "lovecheck",
  react: "❤️",
  desc: "Fun love % between two users",
  category: "fun",
  use: ".lovecheck <@user>",
  filename: __filename
}, async (_ctx, message, args, { reply, sender }) => {
  const mentionedUser = message.mentionedJid?.[0];

  if (!mentionedUser) {
    return safeReply(conn, mek.key.remoteJid, "❌ Please mention a user to check love compatibility.\nExample: .lovecheck @user");
  }

  const love = Math.floor(Math.random() * 101);
  safeReply(conn, mek.key.remoteJid, `💕 Love compatibility between *${sender.split("@")[0]}* and *${mentionedUser.split("@")[0]}*: *${love}%*`);
});

// Match Me Command
cmd({
  pattern: "matchme",
  react: "🤝",
  desc: "Randomly pair 2 members in the group",
  category: "fun",
  use: ".matchme",
  filename: __filename
}, async (_ctx, msg, _args, { reply, groupMetadata }) => {
  const participants = groupMetadata.participants.map(p => p.id);
  if (participants.length < 2)
    return safeReply(conn, mek.key.remoteJid, "Not enough members to match.");

  const pick = () => participants.splice(Math.floor(Math.random() * participants.length), 1)[0];
  const a = pick();
  const b = pick();

  const aUser = a.split("@")[0];
  const bUser = b.split("@")[0];
  const zeroWidthSpace = "\u200b";

  const text = `Match: @${aUser}${zeroWidthSpace} ❤️ @${bUser}${zeroWidthSpace}`;

  safeReply(conn, mek.key.remoteJid, text, { mentions: [{ id: a }, { id: b }] });
});

// Reverse Text Command
cmd({
  pattern: "reverse",
  react: "🔄",
  desc: "Replies with the reversed text",
  category: "fun",
  use: ".reverse <text>",
  filename: __filename
}, (_ctx, _msg, args, { reply }) => {
  const input = args.join(" ");
  if (!input) return safeReply(conn, mek.key.remoteJid, "❗️ Please provide text to reverse.");
  safeReply(conn, mek.key.remoteJid, input.split("").reverse().join(""));
});



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
            const jokeMessage = `${res.setup}\n\n👉 ${res.punchline}`;
            
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
            return safeReply(conn, mek.key.remoteJid, "Couldn't fetch a joke at the moment. Try again later!");
        }
    } catch (e) {
        console.error(e);
        return safeReply(conn, mek.key.remoteJid, `Error: ${e.message || e}`);
    }
});

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
            return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch a quote. Please try again.");
        }

        const quoteMessage = `💬 *Quote of the Day* 💬\n\n_\"${data.response.quote}\"_\n\n- *${data.response.author}*`;
        
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
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
    }
});

cmd({
    pattern: "pickupline",
    desc: "Get a random pick-up line.",
    category: "other",
    react: "💡",
    filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
    try {
        const response = await axios.get('https://apis.davidcyriltech.my.id/pickupline');
        const data = response.data;
        let imageUrl = "https://i.ibb.co/6Rxhg321/Chat-GPT-Image-Mar-30-2025-03-39-42-AM.png";

        if (!data.success) {
            return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch a pick-up line. Please try again.");
        }

        // Use correct property name
        const quoteMessage = `💬 *PICKUPLINE of the Day* 💬\n\n_\"${data.pickupline}\"_\n\n`;
        
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
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
    }
});


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
            return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch advice. Please try again.");
        }

        const quoteMessage = `💬 *Advice of the Day* 💬\n\n_\"${data.result}\"_\n\n`;

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
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
    }
});

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
            return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch good night wishes. Please try again.");
        }

        const quoteMessage = `🌌 *Good Night Wishes* 🌌\n\n_\"${data.result}\"_\n\n`;

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
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
    }
});

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
            return safeReply(conn, mek.key.remoteJid, "❌ Failed to fetch motivation quote. Please try again.");
        }

        const quoteMessage = `💪 *Motivational Quote* 💪\n\n_\"${data.result}\"_\n\n`;

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
        safeReply(conn, mek.key.remoteJid, `❌ Error: ${error.message}`);
    }
});


cmd({
    pattern: "charquote",
    alias: ["animequote", "quotechar"],
    react: "📝",
    desc: "Get an anime character quote",
    category: "📁 Fun",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) return safeReply(conn, mek.key.remoteJid, "❌ Please provide a character name. Example: charquote light yagami");

        const character = encodeURIComponent(q);
        const res = await fetch(`https://api.giftedtech.co.ke/api/anime/char-quotes?apikey=gifted_api_6kuv56877d&character=${character}`);
        const data = await res.json();

        if (!data.success || !data.result) return safeReply(conn, mek.key.remoteJid, "❌ Could not fetch quote for this character.");

        const msg = `
╭━[   *ANIME CHARACTER QUOTE*   ]━╮
┃ 🔹 *Character:* ${data.result.character}
┃ 🎬 *Show:* ${data.result.show}
┃ 💬 *Quote:* "${data.result.quote}"
┃ 🧊 *Status:* Fetched successfully!
╰━━━━━━━━━━━━━━━━━━━━╯
`;

        safeReply(conn, mek.key.remoteJid, msg);
    } catch (err) {
        console.error(err);
        safeReply(conn, mek.key.remoteJid, "❌ Error fetching the quote.");
    }
});
