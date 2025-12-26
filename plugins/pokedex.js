const axios = require('axios');
const { cmd } = require('../command');

cmd(
  {
    pattern: "pokedex",
    react: "🔍",
    desc: "Get detailed Pokémon information.",
    category: "anime",
    filename: __filename,
  },
  async (robin, mek, m, { from, args, reply, sender }) => {
    try {
      const pokemonName = args.join(' ').toLowerCase();
      if (!pokemonName) throw new Error('Please provide a Pokémon name to search for.');

      // Fetch Pokémon data
      const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(pokemonName)}`;
      const { data: json, status } = await axios.get(url);

      if (status !== 200 || !json.name) {
        throw new Error(json.error || 'Pokémon not found.');
      }

      // Safely get fields with fallbacks
      const type = Array.isArray(json.type) ? json.type.join(', ') : 'N/A';
      const species = Array.isArray(json.species) ? json.species.join(', ') : 'N/A';
      const abilities = Array.isArray(json.abilities) ? json.abilities.join(', ') : 'N/A';
      const gender = Array.isArray(json.gender) ? json.gender.join(', ') : 'N/A';
      const eggGroups = Array.isArray(json.egg_groups) ? json.egg_groups.join(', ') : 'N/A';
      const stats = json.stats || {};
      const family = json.family || {};
      const evolutionLine = Array.isArray(family.evolutionLine) ? family.evolutionLine.join(' → ') : 'N/A';

      const message = `
*Name:* ${json.name}
*ID:* ${json.id || 'N/A'}
*Type:* ${type}
*Species:* ${species}
*Abilities:* ${abilities}
*Height:* ${json.height || 'N/A'}
*Weight:* ${json.weight || 'N/A'}
*Base Experience:* ${json.base_experience || 'N/A'}
*Gender Ratio:* ${gender}
*Egg Groups:* ${eggGroups}
*Stats:*
  - HP: ${stats.hp || 'N/A'}
  - Attack: ${stats.attack || 'N/A'}
  - Defense: ${stats.defense || 'N/A'}
  - Sp. Atk: ${stats.sp_atk || 'N/A'}
  - Sp. Def: ${stats.sp_def || 'N/A'}
  - Speed: ${stats.speed || 'N/A'}
  - Total: ${stats.total || 'N/A'}
*Evolution Stage:* ${family.evolutionStage || 'N/A'}
*Evolution Line:* ${evolutionLine}
*Generation:* ${json.generation || 'N/A'}
*Description:* ${json.description || 'N/A'}
      `.trim();

      // Image URL (animated preferred)
      const imageUrl = (json.sprites && (json.sprites.animated || json.sprites.normal)) || null;
      if (!imageUrl) {
        return safeReply(conn, mek.key.remoteJid, 'Image not found for this Pokémon.');
      }

      // Download image as buffer
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'utf-8');

      // Context info for forwarding and embed (your existing newsletterContext)
      const newsletterContext = {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363422794491778@newsletter",
          newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄 𝟐",
          serverMessageId: 200,
        },
        externalAdReply: {
          title: `HANS BYTE MD`,
          body: `BY HANS TECH`,
          mediaType: 2,
          thumbnailUrl: "https://files.catbox.moe/kzqia3.jpeg",
          showAdAttribution: true,
          sourceUrl: "https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
        }
      };

      // Send image + caption message
      await robin.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: message,
          mimetype: 'image/png',
          contextInfo: newsletterContext,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.error(e);
      safeReply(conn, mek.key.remoteJid, `❌ Error: ${e.message || e}`);
    }
  }
);
