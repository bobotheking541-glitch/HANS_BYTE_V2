const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "define",
    react: "📖",
    desc: "Search for a word definition on Urban Dictionary",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, { args, from }) => {
    try {
        if (!args.length) throw new Error('Please provide a word to search for.');

        const query = args.join(' ');
        console.log(`[INFO] Searching definition for: ${query}`);

        const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const json = await response.json();

        if (!response.ok) throw new Error(`An error occurred: ${json.message}`);
        if (!json.list.length) throw new Error('Word not found in the dictionary.');

        const firstEntry = json.list[0];
        const definition = firstEntry.definition.replace(/\[/g, '').replace(/\]/g, ''); // Clean up brackets
        const example = firstEntry.example ? `\n\n*Example:* ${firstEntry.example}` : '';

        const message = `📖 *Word:* ${query}\n\n*Definition:* ${definition}${example}`;
        await safeSend(conn, from, { text: message }, { quoted: mek });

    } catch (error) {
        console.error("[ERROR] define command:", error);
        await safeSend(conn, from, { text: `Error: ${error.message}` }, { quoted: mek });
    }
});