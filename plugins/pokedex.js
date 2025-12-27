const axios = require('axios')
const { cmd } = require('../command')

cmd({
  pattern: "pokedex",
  react: "🔍",
  desc: "Get detailed Pokémon information",
  category: "anime",
  filename: __filename
}, async (conn, mek, m, { from, args, sender }) => {

  console.log("⚡ [POKEDEX] Triggered")

  try {
    const query = args.join(' ').trim().toLowerCase()
    if (!query) {
      return conn.sendMessage(
        from,
        { text: "❌ Example: `.pokedex pikachu`" },
        { quoted: mek }
      )
    }

    console.log("🔎 [POKEDEX] Pokémon:", query)

    // 1️⃣ Fetch Pokémon data
    let data
    try {
      const res = await axios.get(
        `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      )
      data = res.data
    } catch (err) {
      console.error("🔥 [POKEDEX] Pokémon API error:", err.message)
      return conn.sendMessage(from, { text: "❌ Failed to fetch Pokémon data." }, { quoted: mek })
    }

    if (!data?.name) {
      return conn.sendMessage(from, { text: "❌ Pokémon not found." }, { quoted: mek })
    }

    // 2️⃣ Safe parsing
    const type = Array.isArray(data.type) ? data.type.join(', ') : 'N/A'
    const species = Array.isArray(data.species) ? data.species.join(', ') : 'N/A'
    const abilities = Array.isArray(data.abilities) ? data.abilities.join(', ') : 'N/A'
    const gender = Array.isArray(data.gender) ? data.gender.join(', ') : 'N/A'
    const eggGroups = Array.isArray(data.egg_groups) ? data.egg_groups.join(', ') : 'N/A'
    const stats = data.stats || {}
    const family = data.family || {}
    const evoLine = Array.isArray(family.evolutionLine)
      ? family.evolutionLine.join(' → ')
      : 'N/A'

    // 3️⃣ Caption
    const caption = `
╔══✦❘༻ *HANS BYTE* ༺❘✦══╗
┇      ⚡ *POKÉDEX INFO* ⚡
┇╭──────────────────────────
┇│ 🐭 *Name:* ${data.name}
┇│ 🆔 *ID:* ${data.id || 'N/A'}
┇│ ⚡ *Type:* ${type}
┇│ 🧬 *Species:* ${species}
┇│ ✨ *Abilities:* ${abilities}
┇│ 📏 *Height:* ${data.height || 'N/A'}
┇│ ⚖️ *Weight:* ${data.weight || 'N/A'}
┇│ 🔋 *Base Exp:* ${data.base_experience || 'N/A'}
┇│ 🚻 *Gender:* ${gender}
┇│ 🥚 *Egg Groups:* ${eggGroups}
┇│
┇│ 📊 *Stats*
┇│   • ❤️ HP: ${stats.hp || 'N/A'}
┇│   • 🗡️ ATK: ${stats.attack || 'N/A'}
┇│   • 🛡️ DEF: ${stats.defense || 'N/A'}
┇│   • 🔮 SpA: ${stats.sp_atk || 'N/A'}
┇│   • 🧿 SpD: ${stats.sp_def || 'N/A'}
┇│   • 💨 SPD: ${stats.speed || 'N/A'}
┇│   • 📈 Total: ${stats.total || 'N/A'}
┇│
┇│ 🌱 *Evolution Stage:* ${family.evolutionStage || 'N/A'}
┇│ 🔄 *Evolution Line:* ${evoLine}
┇│
┇│ 🧪 *Generation:* ${data.generation || 'N/A'}
┇│ 📖 *Description:*
┇│   ${data.description || 'N/A'}
┇╰─・─・─・─・─・─・─・─╯
╰─・─・─・─・─・──・─・─・─╯
> ⚡ POWERED BY HANS BYTE MD ⚡
`.trim()

    // 4️⃣ Newsletter context
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
        title: "HANS BYTE MD",
        body: "BY HANS TECH",
        mediaType: 2,
        thumbnailUrl: "https://files.catbox.moe/kzqia3.jpeg",
        showAdAttribution: true,
        sourceUrl: "https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O"
      }
    }

    // 5️⃣ Pokémon-indexed Unsplash search
    console.log("🖼️ [POKEDEX] Searching Unsplash (indexed)")

    let imageBuffer = null
    try {
      const searchQuery = `${query} pokemon anime character`
      const imgSearch = await axios.get(
        `https://api.giftedtech.co.ke/api/search/unsplash`,
        {
          params: {
            apikey: "gifted_api_6kuv56877d",
            query: searchQuery
          },
          timeout: 5000
        }
      )

      const urls = imgSearch.data?.results
      console.log("🧪 [POKEDEX] Images found:", urls?.length || 0)

      if (Array.isArray(urls)) {
        const usable = urls.find(u => typeof u === 'string' && u.includes('images.unsplash.com'))

        if (usable) {
          console.log("🖼️ [POKEDEX] Using image:", usable)

          const img = await axios.get(usable, {
            responseType: 'arraybuffer',
            timeout: 2000
          })
          imageBuffer = Buffer.from(img.data)
        } else {
          console.warn("⚠️ [POKEDEX] No usable Unsplash CDN URL")
        }
      }
    } catch (err) {
      console.warn("⚠️ [POKEDEX] Unsplash error:", err.message)
    }

    // 6️⃣ Send message
    if (imageBuffer) {
      await conn.sendMessage(
        from,
        { image: imageBuffer, caption, contextInfo: newsletterContext },
        { quoted: mek }
      )
    } else {
      await conn.sendMessage(
        from,
        { text: caption, contextInfo: newsletterContext },
        { quoted: mek }
      )
    }

    console.log("✅ [POKEDEX] Done")

  } catch (err) {
    console.error("💀 [POKEDEX] Fatal error:", err)
    await conn.sendMessage(
      from,
      { text: `❌ Unexpected error:\n${err.message || err}` },
      { quoted: mek }
    )
  }
})
