// Made for future use if needed

const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'hamgotchi.json');
const DEFAULT_SAVE = { users: {}, mobs: {}, meta: { startedAt: Date.now() } };

// ensure data dir + file
try { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); } catch (e) {}
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_SAVE, null, 2));

/** -----------------------
 *  Utilities
 *  ----------------------- */
const readData = () => {
    try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8') || '{}'); }
    catch (e) { return DEFAULT_SAVE; }
};
const writeData = (d) => fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2));

const now = () => Date.now();
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Level formula
 * XP required = level^2 * XP_BASE
 */
const XP_BASE = 120;
const xpForLevel = (level) => (level * level) * XP_BASE;

const defaultPet = () => ({
    name: 'Ham',
    species: pick(['Crimson Ham','Shadow Fox','Iron Turtle','Neon Ferret','Dust Hare']),
    rarity: pick(['Common','Uncommon','Rare','Epic','Mythic']),
    happiness: 80,
    energy: 100,
    level: 1,
    xp: 0,
    evolved: false,
    createdAt: now(),
});

/** Ensure user record exists */
function ensureUser(data, jid, username = null) {
    if (!data.users[jid]) {
        data.users[jid] = {
            jid,
            username: username || jid.split('@')[0],
            xp: 0,
            level: 1,
            coins: 0,
            pet: defaultPet(),
            session: {
                lastMine: 0,
                lastFeed: 0,
                lastPlay: 0,
                lastExplore: 0,
                lastMob: 0,
                lastFinalTrial: 0,
                lastGift: 0,
            },
            inventory: {},
            achievements: [],
            createdAt: now(),
        };
    }
    return data.users[jid];
}

function saveUser(data, user) {
    data.users[user.jid] = user;
    writeData(data);
}

/** Award xp and handle levelling */
function awardXp(user, amount) {
    user.xp += amount;
    user.pet.xp += amount;
    // sync overall xp to pet xp? keep both - pet xp for evolution, user xp for leaderboards
    while (user.xp >= xpForLevel(user.level + 1)) {
        user.level++;
        // reward on level up
        const coinsReward = Math.floor(user.level * rand(15, 40));
        user.coins += coinsReward;
        user.achievements.push(`Reached level ${user.level}`);
    }
    // Evolution check for pet using pet.xp thresholds
    const petLevel = Math.floor(Math.sqrt(user.pet.xp / 100));
    if (petLevel > user.pet.level) {
        user.pet.level = petLevel;
        // small reward
        user.coins += petLevel * 20;
    }
}

/** Simple inventory ops */
function addItem(user, id, qty = 1) {
    user.inventory[id] = (user.inventory[id] || 0) + qty;
}
function removeItem(user, id, qty = 1) {
    if (!user.inventory[id]) return false;
    if (user.inventory[id] < qty) return false;
    user.inventory[id] -= qty;
    if (user.inventory[id] === 0) delete user.inventory[id];
    return true;
}

/** Shop catalog (tweak costs/power) */
const SHOP = {
    food: { id: 'food', name: 'Food', price: 50, effect: { hunger: 20, energy: 20 } },
    toy: { id: 'toy', name: 'Toy', price: 120, effect: { happiness: 20 } },
    booster: { id: 'booster', name: 'Lucky Booster (30m)', price: 350, effect: { coinBoost: 2, durationMin: 30 } },
    smallEgg: { id: 'smallEgg', name: 'Small Mystery Egg', price: 500, effect: { spawnEgg: true } },
    finalKey: { id: 'finalKey', name: 'Final Trial Key', price: 50000, effect: { finalKey: true } },
};

/** Mobs database (spawned dynamically too) */
const MOB_TEMPLATES = [
    { name: 'Pest Rat', level: 1, rarity: 'Common', xp: 8, coins: 20 },
    { name: 'Feral Pigeon', level: 3, rarity: 'Common', xp: 12, coins: 35 },
    { name: 'Rogue Dog', level: 6, rarity: 'Uncommon', xp: 25, coins: 80 },
    { name: 'Iron Boar', level: 12, rarity: 'Rare', xp: 80, coins: 250 },
    { name: 'Night Serpent', level: 25, rarity: 'Epic', xp: 300, coins: 900 },
    { name: 'Void Drake', level: 45, rarity: 'Mythic', xp: 1200, coins: 4000 }
];

/** Context info (newsletter-style UI in replies) */
const newsletterContext = {
    mentionedJid: [],
    forwardingScore: 1000,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363422794491778@newsletter',
        newsletterName: "𝐇𝐀𝐍𝐒 𝐁𝐘𝐓𝐄",
        serverMessageId: 143,
    },
};

/** Small UI helpers */
const petBadge = (r) => {
    switch (r) {
        case 'Common': return '⚪';
        case 'Uncommon': return '🔵';
        case 'Rare': return '🟣';
        case 'Epic': return '🟡';
        case 'Mythic': return '🔶';
        default: return '';
    }
};
const formatUserShort = (u) => `${u.username} — Lv ${u.level} | ${u.coins}🪙`;

/** -----------------------
 * Commands
 * ----------------------- */

/**
 * Main menu / ham command
 */
cmd({
    pattern: 'ham',
    alias: ['hamgotchi','hammenu'],
    desc: 'Open the Hamgotchi menu',
    category: 'game',
    react: '🐹',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const menu = [
        '╭━━━〔 *HAMGOTCHI v1* 〕━━━⊷',
        `┃▸ Owner: Hans Tech`,
        `┃▸ Pet: ${user.pet.name} ${petBadge(user.pet.rarity)} (${user.pet.species})`,
        `┃▸ Lv:${user.level} XP:${user.xp}/${xpForLevel(user.level+1)} Coins:${user.coins}🪙`,
        '┃',
        '┃ Commands (type):',
        '┃ .pethatch  .status  .mine  .feed  .play  .rest',
        '┃ .explore  .mobhunt  .battle  .shop  .buy <num>',
        '┃ .inventory  .hamtop  .evolve  .finaltrial  .gift',
        '┃ .quests  .daily  .redeem <code>',
        '╰━━━⪼',
        'Tip: actions have cooldowns. Be creative and patient — the top is very hard.'
    ].join('\n');

    await safeSend(conn, from, { text: menu, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});

/**
 * hatch command (allows first-time or buy egg)
 */
cmd({
    pattern: 'pethatch',
    alias: ['hatch','hamhatch'],
    desc: 'Hatch a mystery egg or claim starter pet',
    category: 'game',
    react: '🥚',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    // if they already have pet createdAt recently allow renaming/evolves, but let them hatch an extra egg if they buy one
    if (!user.pet || (user.pet && user.pet.createdAt && now() - user.pet.createdAt > 0 && args[0] === 'new')) {
        user.pet = defaultPet();
        user.coins += 100;
        await safeSend(conn, from, { text: `🥚 Your new Hamgotchi hatched!\nName: ${user.pet.name}\nSpecies: ${user.pet.species}\nRarity: ${user.pet.rarity}\nYou also found 100🪙 as starter.`, contextInfo: newsletterContext }, { quoted: m });
    } else {
        await safeSend(conn, from, { text: `🐾 You already have a pet: ${user.pet.name} (${user.pet.species}). Use .status or buy smallEgg to hatch more.`, contextInfo: newsletterContext }, { quoted: m });
    }

    saveUser(data, user);
});


/**
 * status
 */
cmd({
    pattern: 'status',
    alias: ['mystatus','petstatus'],
    desc: 'Show pet and user status',
    category: 'game',
    react: '📊',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const s = [
        `╭━━━〔 *HAMGOTCHI STATUS* 〕━━━⊷`,
        `┃▸ ${user.username} — Lv ${user.level} | XP ${user.xp}/${xpForLevel(user.level+1)}`,
        `┃▸ Coins: ${user.coins}🪙`,
        `┃▸ Pet: ${user.pet.name} ${petBadge(user.pet.rarity)} (${user.pet.species})`,
        `┃▸ Pet Lv: ${user.pet.level} | Pet XP: ${user.pet.xp}`,
        `┃▸ Happiness: ${user.pet.happiness}% | Energy: ${user.pet.energy}%`,
        `┃▸ Inventory: ${Object.keys(user.inventory).length ? Object.entries(user.inventory).map(([k,v])=>`${k}x${v}`).join(', ') : 'Empty'}`,
        `╰━━━⪼`
    ].join('\n');

    await safeSend(conn, from, { text: s, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});

/**
 * mine - passive coin generation with cooldown and RNG
 */
cmd({
    pattern: 'mine',
    alias: ['dig','farm'],
    desc: 'Send your Hamgotchi to mine for coins (cooldown)',
    category: 'game',
    react: '⛏️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const COOLDOWN = 1000 * 60 * 15; // 15 minutes
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (now() - user.session.lastMine < COOLDOWN) {
        const wait = Math.ceil((COOLDOWN - (now() - user.session.lastMine)) / 60000);
        return safeSend(conn, from, { text: `⏳ Your pet is resting from mining. Wait ${wait} minute(s).`, contextInfo: newsletterContext }, { quoted: m });
    }

    user.session.lastMine = now();
    // coin gain scales with pet level and randomness; boosters in inventory apply
    let base = rand(20, 80) + Math.floor(user.pet.level * rand(2,7));
    if (user.inventory.booster) base *= 2;
    const luck = rand(1,100);
    let eventText = '';
    if (luck > 98) {
        // jackpot
        const jackpot = base * rand(8,15);
        user.coins += jackpot;
        awardXp(user, rand(12, 28));
        eventText = `💥 Jackpot! Your pet found a hidden vault: +${jackpot}🪙`;
    } else if (luck > 85) {
        const found = Math.floor(base * rand(2,4));
        user.coins += found;
        awardXp(user, rand(8,15));
        eventText = `🧭 Lucky find! +${found}🪙`;
    } else if (luck < 5) {
        // disaster
        const loss = Math.floor(base * rand(1,3));
        user.coins = Math.max(0, user.coins - loss);
        user.pet.happiness = clamp(user.pet.happiness - rand(5,12), 0, 100);
        awardXp(user, rand(1,4));
        eventText = `💥 Uh oh — bad mining cave. -${loss}🪙 and pet lost some happiness.`;
    } else {
        user.coins += base;
        awardXp(user, rand(5,12));
        eventText = `⛏️ Mining success: +${base}🪙`;
    }

    await safeSend(conn, from, { text: `${eventText}\n✨ Pet earned XP. Use .status to check.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * feed - restore happiness/energy, cooldown
 */
cmd({
    pattern: 'feed',
    alias: ['givefood'],
    desc: 'Feed your pet to restore happiness and energy (buy food in shop)',
    category: 'game',
    react: '🍖',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const COOLDOWN = 1000 * 60 * 10; // 10 minutes
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (now() - user.session.lastFeed < COOLDOWN) {
        const wait = Math.ceil((COOLDOWN - (now() - user.session.lastFeed)) / 60000);
        return safeSend(conn, from, { text: `⏳ Food still digesting. Wait a bit before feeding again.`, contextInfo: newsletterContext }, { quoted: m });
    }

    // Check if they have food
    if (!user.inventory.food || user.inventory.food < 1) {
        return safeSend(conn, from, { text: `🍽️ You have no Food. Buy one with .shop or .buy food`, contextInfo: newsletterContext }, { quoted: m });
    }

    removeItem(user, 'food', 1);
    user.session.lastFeed = now();
    user.pet.happiness = clamp(user.pet.happiness + rand(8, 20), 0, 100);
    user.pet.energy = clamp(user.pet.energy + rand(12, 30), 0, 100);
    awardXp(user, rand(3,8));

    await safeSend(conn, from, { text: `🍖 You fed ${user.pet.name}. Happiness + Energy increased.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * play - increases happiness, uses energy and cooldown
 */
cmd({
    pattern: 'gplay',
    alias: ['toy'],
    desc: 'Play with your pet to increase happiness',
    category: 'game',
    react: '🧸',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const COOLDOWN = 1000 * 60 * 12;
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (now() - user.session.lastPlay < COOLDOWN) {
        return safeSend(conn, from, { text: `🛑 Your pet is tired. Wait before playing again.`, contextInfo: newsletterContext }, { quoted: m });
    }

    if (!user.inventory.toy || user.inventory.toy < 1) {
        return safeSend(conn, from, { text: `🎯 No toys found. Buy one with .shop or .buy toy`, contextInfo: newsletterContext }, { quoted: m });
    }

    removeItem(user, 'toy', 1);
    user.session.lastPlay = now();
    user.pet.happiness = clamp(user.pet.happiness + rand(10, 30), 0, 100);
    user.pet.energy = clamp(user.pet.energy - rand(8, 20), 0, 100);
    awardXp(user, rand(4, 10));

    await safeSend(conn, from, { text: `🧸 You played with ${user.pet.name}. Happiness increased!`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});

/**
 * rest - restore energy over time (instant-ish)
 */
cmd({
    pattern: 'rest',
    alias: ['sleep'],
    desc: 'Let your pet rest to restore energy',
    category: 'game',
    react: '💤',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const restore = rand(20, 45);
    user.pet.energy = clamp(user.pet.energy + restore, 0, 100);
    awardXp(user, rand(1,4));

    await safeSend(conn, from, { text: `💤 ${user.pet.name} rested and recovered ${restore}% energy.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * explore - longer cooldown, higher rewards, chance for rare loot / eggs / mobs
 */
cmd({
    pattern: 'explore',
    alias: ['adventure','expedition'],
    desc: 'Send your pet to explore (1-3 hours cooldown) — high reward & random events',
    category: 'game',
    react: '🗺️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    // 1-3 hours cooldown
    const MIN = 1000 * 60 * 60 * 1;
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    // variable cooldown: user.pet.level affects exploration frequency
    const cooldown = MIN; // can improve later
    if (now() - user.session.lastExplore < cooldown) {
        return safeSend(conn, from, { text: `⏳ ${user.pet.name} is still exploring. Try later.`, contextInfo: newsletterContext }, { quoted: m });
    }

    user.session.lastExplore = now();
    const luck = rand(1,100);
    let text = '';
    if (luck > 97) {
        // Legendary event: find mythic egg or huge coins
        const myth = rand(2000,8000);
        user.coins += myth;
        addItem(user, 'smallEgg', 1);
        awardXp(user, rand(80,160));
        text = `🌟 Incredible! ${user.pet.name} found a Mythic cache: +${myth}🪙 and a Small Mystery Egg!`;
    } else if (luck > 80) {
        const coins = rand(400,1200);
        user.coins += coins;
        awardXp(user, rand(30,80));
        text = `🏔️ Great expedition: +${coins}🪙 and XP!`;
    } else if (luck < 10) {
        // meets mob
        const mobTemp = pick(MOB_TEMPLATES.filter(m=>m.level <= user.level+10));
        text = `⚔️ While exploring, you encountered a ${mobTemp.name} (Lv ${mobTemp.level}). Use .mobhunt to hunt it or .run to escape.`;
        // store last encountered mob in user's session for immediate follow-ups
        user.session.lastEncounter = { mob: mobTemp, time: now() };
    } else {
        const coins = rand(90, 350);
        user.coins += coins;
        awardXp(user, rand(10,25));
        text = `🧭 Exploration returned: +${coins}🪙 and some XP.`;
    }

    await safeSend(conn, from, { text, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * mobhunt - attempt to fight the last encountered mob or random mob; randomness and items affect outcome
 */
cmd({
    pattern: 'mobhunt',
    alias: ['hunt','monster'],
    desc: 'Hunt a mob. Outcome depends on level, items, and RNG',
    category: 'game',
    react: '🗡️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    // Determine target mob
    const encounter = user.session.lastEncounter && now() - user.session.lastEncounter.time < 1000*60*60 ? user.session.lastEncounter.mob : pick(MOB_TEMPLATES.filter(x => x.level <= Math.max(1, user.level + 6)));
    if (!encounter) {
        return safeSend(conn, from, { text: 'No mobs nearby. Try .explore to find one.', contextInfo: newsletterContext }, { quoted: m });
    }

    // base success chance depends on player level vs mob level
    const levelDiff = user.level - encounter.level;
    let successChance = clamp(50 + levelDiff * 4 + (user.pet.happiness/5), 10, 95);

    // items affect chance
    if (user.inventory.booster) successChance += 12;
    if (user.inventory.toy) successChance += 6;
    // random roll
    const roll = rand(1,100);
    let text = '';

    if (roll <= successChance) {
        // win
        const coins = Math.max(1, encounter.coins + rand(-encounter.coins/4, encounter.coins/2));
        const xp = Math.max(1, encounter.xp + rand(-Math.floor(encounter.xp/3), Math.floor(encounter.xp/2)));
        user.coins += coins;
        awardXp(user, xp);
        user.pet.happiness = clamp(user.pet.happiness + rand(3,12), 0, 100);
        text = `✅ Victory! You defeated ${encounter.name}.\n+${coins}🪙  +${xp} XP.`;
        // drop chance for items/eggs
        if (rand(1,100) > 88) { addItem(user, 'smallEgg', 1); text += '\n🎁 Loot: Small Mystery Egg!'; }
        if (rand(1,200) === 200) { addItem(user, 'finalKey', 1); text += '\n🔑 You found a rare Final Trial Key!'; }
    } else {
        // lose
        const lostCoins = Math.floor(user.coins * rand(0.02, 0.12));
        user.coins = Math.max(0, user.coins - lostCoins);
        user.pet.happiness = clamp(user.pet.happiness - rand(6,20), 0, 100);
        awardXp(user, Math.max(1, Math.floor(encounter.xp/4)));
        text = `💥 Defeat. ${encounter.name} overwhelmed your pet.\n-${lostCoins}🪙 and lowered happiness.`;
    }

    // clear encounter
    delete user.session.lastEncounter;
    user.session.lastMob = now();

    await safeSend(conn, from, { text, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * battle (quick PvP-like RNG battles using only stats) - group-only could be implemented later
 */
cmd({
    pattern: 'battle',
    alias: ['pvpbattle'],
    desc: 'Challenge another Hamgotchi owner (reply to user with .battle) — RNG decides',
    category: 'game',
    react: '⚔️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    // If reply to someone, attempt duel
    const data = readData();
    newsletterContext.mentionedJid = [sender];

    if (!m.message?.extendedTextMessage?.contextInfo?.mentionedJid || m.message.extendedTextMessage.contextInfo.mentionedJid.length === 0) {
        return safeSend(conn, from, { text: '⚠️ To battle someone, reply/mention their message and send .battle', contextInfo: newsletterContext }, { quoted: m });
    }
    const opponentJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
    if (opponentJid === sender) return safeSend(conn, from, { text: "You cannot battle yourself silly.", contextInfo: newsletterContext }, { quoted: m });

    const userA = ensureUser(data, sender, m.pushName || null);
    const userB = ensureUser(data, opponentJid, null);

    // compute power score = level * happiness * random
    const scoreA = userA.level * (userA.pet.happiness/10) * rand(80,120) + rand(0,500);
    const scoreB = userB.level * (userB.pet.happiness/10) * rand(80,120) + rand(0,500);
    let msg = `⚔️ *Battle Result*\n${userA.username} vs ${userB.username}\n\n`;
    if (scoreA > scoreB) {
        const coins = rand(80, 280);
        userA.coins += coins;
        awardXp(userA, rand(10,30));
        userB.coins = Math.max(0, userB.coins - Math.floor(coins/3));
        msg += `${userA.username} wins! +${coins}🪙\n${userB.username} lost some coins.`;
    } else if (scoreB > scoreA) {
        const coins = rand(80, 280);
        userB.coins += coins;
        awardXp(userB, rand(10,30));
        userA.coins = Math.max(0, userA.coins - Math.floor(coins/3));
        msg += `${userB.username} wins! +${coins}🪙\n${userA.username} lost some coins.`;
    } else {
        msg += 'It was a draw — both sides learn from the clash. +small XP to both.';
        awardXp(userA, 8); awardXp(userB, 8);
    }

    await safeSend(conn, from, { text: msg, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, userA); saveUser(data, userB);
});


/**
 * shop - display shop
 */
cmd({
    pattern: 'shop',
    alias: ['store'],
    desc: 'Show the Hamgotchi shop',
    category: 'game',
    react: '🛒',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    newsletterContext.mentionedJid = [sender];
    let menu = '╭━━━〔 *HAMGOTCHI SHOP* 〕━━━⊷\n';
    let i = 1;
    for (const key of Object.keys(SHOP)) {
        const item = SHOP[key];
        menu += `┃${i}. ${item.name} — ${item.price}🪙 (id: ${item.id})\n`;
        i++;
    }
    menu += '╰━━━⪼\nUse .buy <id> to purchase (example: .buy food)';
    await safeSend(conn, from, { text: menu, contextInfo: newsletterContext }, { quoted: m });
});


/**
 * buy - buy item by id
 */
cmd({
    pattern: 'buy',
    alias: ['purchase'],
    desc: 'Buy an item from shop. Example: .buy food',
    category: 'game',
    react: '💸',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (!args[0]) return safeSend(conn, from, { text: 'Usage: .buy <id>. See .shop for ids', contextInfo: newsletterContext }, { quoted: m });
    const id = args[0].toLowerCase();
    const item = Object.values(SHOP).find(it => it.id === id);
    if (!item) return safeSend(conn, from, { text: 'Item not found. Check .shop', contextInfo: newsletterContext }, { quoted: m });

    if (user.coins < item.price) return safeSend(conn, from, { text: `You need ${item.price}🪙 to buy ${item.name}.`, contextInfo: newsletterContext }, { quoted: m });

    user.coins -= item.price;
    addItem(user, item.id, 1);
    await safeSend(conn, from, { text: `✅ Purchased ${item.name}. Use inventory or actions to use it.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * inventory - show items
 */
cmd({
    pattern: 'inventory',
    alias: ['inv','bag'],
    desc: 'Show your inventory',
    category: 'game',
    react: '🎒',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const inv = Object.keys(user.inventory).length ? Object.entries(user.inventory).map(([k,v]) => `${k} x${v}`).join('\n') : 'Empty';
    await safeSend(conn, from, { text: `╭━━━〔 *INVENTORY* 〕━━━⊷\n${inv}\n╰━━━⪼`, contextInfo: newsletterContext }, { quoted: m });
});

/**
 * hamtop - leaderboard
 */
cmd({
    pattern: 'hamtop',
    alias: ['leaderboard','hamleader'],
    desc: 'Show leaderboard',
    category: 'game',
    react: '🏆',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    newsletterContext.mentionedJid = [sender];

    const users = Object.values(data.users);
    if (!users.length) return safeSend(conn, from, { text: 'No players yet.', contextInfo: newsletterContext }, { quoted: m });

    const sorted = users.sort((a,b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.coins - a.coins;
    }).slice(0, 10);

    let text = '🏆 *HAMGOTCHI LEADERBOARD* 🏆\n\n';
    sorted.forEach((u, idx) => {
        text += `${idx+1}. ${u.username} — Lv ${u.level} | ${u.xp} XP | ${u.coins}🪙\n`;
    });

    await safeSend(conn, from, { text, contextInfo: newsletterContext }, { quoted: m });
});


/**
 * evolve - attempt pet evolution at certain pet XP thresholds
 */
cmd({
    pattern: 'evolve',
    alias: ['evo'],
    desc: 'Attempt to evolve your pet when it has enough pet XP',
    category: 'game',
    react: '✨',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    // simple checks: require pet.xp > threshold and coin cost
    const threshold = (user.pet.level + 1) * 100; // tweak
    const cost = Math.max(500, user.pet.level * 200);
    if (user.pet.xp < threshold) return safeSend(conn, from, { text: `Your pet lacks experience to evolve. Need pet XP >= ${threshold}.`, contextInfo: newsletterContext }, { quoted: m });
    if (user.coins < cost) return safeSend(conn, from, { text: `You need ${cost}🪙 to trigger evolution.`, contextInfo: newsletterContext }, { quoted: m });

    user.coins -= cost;
    // announce evolution with RNG chance to gain rarer form
    const roll = rand(1,100);
    let oldRarity = user.pet.rarity;
    if (roll > 92) user.pet.rarity = 'Mythic';
    else if (roll > 75) user.pet.rarity = 'Epic';
    else if (roll > 50) user.pet.rarity = 'Rare';
    else if (roll > 28) user.pet.rarity = 'Uncommon';
    else user.pet.rarity = 'Common';
    user.pet.evolved = true;
    // bump pet stats
    user.pet.happiness = clamp(user.pet.happiness + rand(10,25), 0, 100);
    user.pet.energy = clamp(user.pet.energy + rand(10,25), 0, 100);
    awardXp(user, rand(20,40));

    await safeSend(conn, from, { text: `✨ Evolution result: ${user.pet.name} evolved!\nRarity: ${oldRarity} → ${user.pet.rarity}\nPet got stronger and happier.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * finaltrial - extremely hard final level attempt; expensive and rare keys reduce difficulty
 */
cmd({
    pattern: 'finaltrial',
    alias: ['endgame','finalboss'],
    desc: 'Attempt the Final Trial (VERY DIFFICULT). Big cost and cooldown.',
    category: 'game',
    react: '☠️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const COOLDOWN = 1000 * 60 * 60 * 24 * 7; // 7 days
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (user.level < 99) return safeSend(conn, from, { text: 'You must be at least Level 99 to attempt Final Trial.', contextInfo: newsletterContext }, { quoted: m });
    if (now() - user.session.lastFinalTrial < COOLDOWN) return safeSend(conn, from, { text: 'Final Trial cooldown active. Try later.', contextInfo: newsletterContext }, { quoted: m });

    // cost: either huge coins or have Final Key in inventory (preferred)
    const hasKey = user.inventory.finalKey && user.inventory.finalKey > 0;
    const cost = 50000;
    if (!hasKey && user.coins < cost) return safeSend(conn, from, { text: `You need ${cost}🪙 or a Final Trial Key to enter.`, contextInfo: newsletterContext }, { quoted: m });

    if (hasKey) removeItem(user, 'finalKey', 1);
    else user.coins -= cost;

    // difficulty: massive failure chance; boosters reduce it
    let failChance = 92;
    if (user.inventory.booster) failChance -= 14;
    if (user.pet.rarity === 'Mythic') failChance -= 10;
    if (user.achievements.includes('Reached level 100')) failChance -= 5;

    const roll = rand(1,100);
    let text = '';
    if (roll > failChance) {
        // success — ultimate reward: direct contact + special perks
        user.level = 100;
        user.achievements.push('Reached level 100');
        user.coins += 100000;
        user.pet.rarity = 'Mythic';
        text = `🏆 CONGRATULATIONS! You conquered the Final Trial and reached Level 100!\nRewards: 100000🪙, Mythic pet, and the Grand Reward.\nYour prize: You may request one special service / ask-one-anything coupon from the owner (Hans Tech). Use .gift to redeem.`;
        // flag special gift
        addItem(user, 'grandGift', 1);
    } else {
        // failure: penalty but not total wipe
        const xpLoss = Math.floor(user.xp * rand(0.05, 0.18));
        user.xp = Math.max(1, user.xp - xpLoss);
        user.pet.happiness = clamp(user.pet.happiness - rand(10,30), 0, 100);
        text = `💥 The Final Trial rejected you. You lost ${xpLoss} XP and your pet lost morale. Try again in 7 days.`;
    }

    user.session.lastFinalTrial = now();
    await safeSend(conn, from, { text, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * gift - redeem special rewards; owner-contact voucher when reaching top
 */
cmd({
    pattern: 'gift',
    alias: ['redeemgift','claimgift'],
    desc: 'Redeem special gift items (eg grandGift) or use ask-anything coupon',
    category: 'game',
    react: '🎁',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (user.inventory.grandGift && user.inventory.grandGift > 0) {
        removeItem(user, 'grandGift', 1);
        // grant the special permission: owner contact request token
        addItem(user, 'askAnythingCoupon', 1);
        await safeSend(conn, from, { text: '🎉 Grand Gift redeemed: You now have an Ask-Anything coupon. Use .ask to request a service (owner decides eligibility).', contextInfo: newsletterContext }, { quoted: m });
        saveUser(data, user);
        return;
    }

    if (args[0] && args[0] === 'ask') {
        // claim ask-anything coupon
        if (!user.inventory.askAnythingCoupon) return safeSend(conn, from, { text: 'No ask-anything coupon found. Reach Level 75+ or earn the grandGift.', contextInfo: newsletterContext }, { quoted: m });
        removeItem(user, 'askAnythingCoupon', 1);
        // store request for the owner: write to data.meta.requests
        data.meta.requests = data.meta.requests || [];
        data.meta.requests.push({ from: user.jid, at: now(), request: args.slice(1).join(' ') || 'Ask-anything coupon used' });
        writeData(data);
        await safeSend(conn, from, { text: '✅ Coupon used. Your request was forwarded to the owner for review.', contextInfo: newsletterContext }, { quoted: m });
        return;
    }

    await safeSend(conn, from, { text: '🎁 You have no redeemable gifts. Earn them by exploring, winning mobs, or reaching the final level.', contextInfo: newsletterContext }, { quoted: m });
});

/**
 * quests - very simple weekly quests to keep engagement
 */
cmd({
    pattern: 'quests',
    alias: ['dailyquests','tasks'],
    desc: 'Show available quests and claim rewards',
    category: 'game',
    react: '📜',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    // example quests: Mine X times, Explore Y times, Win Z mobs (track via meta quest progress)
    data.meta.questProgress = data.meta.questProgress || {};
    data.meta.questProgress[user.jid] = data.meta.questProgress[user.jid] || { mined: 0, explored: 0, wins: 0, lastReset: now() };

    // reset weekly
    if (now() - data.meta.questProgress[user.jid].lastReset > 1000*60*60*24*7) {
        data.meta.questProgress[user.jid] = { mined: 0, explored: 0, wins: 0, lastReset: now() };
    }

    const q = data.meta.questProgress[user.jid];
    // present simple quests
    const quests = [
        { id: 'q1', desc: 'Mine 10 times', prog: `${q.mined}/10`, reward: '500🪙 + 30 XP' },
        { id: 'q2', desc: 'Explore 3 times', prog: `${q.explored}/3`, reward: '1 smallEgg' },
        { id: 'q3', desc: 'Win 5 mobhunts', prog: `${q.wins}/5`, reward: '2000🪙' },
    ];

    let text = '📜 Weekly Quests\n\n';
    quests.forEach(qu => text += `${qu.desc} — ${qu.prog} — Reward: ${qu.reward}\n`);
    text += '\nUse actions to progress. Claim reward automatically when complete (work in background).';

    await safeSend(conn, from, { text, contextInfo: newsletterContext }, { quoted: m });
    writeData(data);
});

/**
 * daily - daily login reward
 */
cmd({
    pattern: 'daily',
    alias: ['claimdaily'],
    desc: 'Claim daily reward',
    category: 'game',
    react: '🗓️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const last = user.session.lastDaily || 0;
    if (now() - last < 1000 * 60 * 60 * 24) {
        return safeSend(conn, from, { text: '⏳ You already claimed your daily reward. Come back tomorrow.', contextInfo: newsletterContext }, { quoted: m });
    }

    user.session.lastDaily = now();
    const rewardCoins = rand(60, 300);
    user.coins += rewardCoins;
    addItem(user, 'food', rand(0,2));
    awardXp(user, rand(8,20));
    await safeSend(conn, from, { text: `🎁 Daily claimed: +${rewardCoins}🪙 and some food.`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});


/**
 * redeem - admin/easy codes (simple)
 */
cmd({
    pattern: 'redeem',
    alias: ['code'],
    desc: 'Redeem a code given by owner (admin only codes like FREE1)',
    category: 'game',
    react: '🔐',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    const code = (args[0]||'').toUpperCase();
    if (!code) return safeSend(conn, from, { text: 'Usage: .redeem <CODE>', contextInfo: newsletterContext }, { quoted: m });

    if (code === 'FREE1') {
        user.coins += 1000;
        addItem(user, 'smallEgg', 1);
        await safeSend(conn, from, { text: 'Code accepted: +1000🪙 and 1 Small Egg', contextInfo: newsletterContext }, { quoted: m });
    } else if (code === 'HANS1') {
        user.coins += 5000;
        addItem(user, 'booster', 1);
        await safeSend(conn, from, { text: 'Code accepted: +5000🪙 and 1 Booster', contextInfo: newsletterContext }, { quoted: m });
    } else {
        await safeSend(conn, from, { text: 'Invalid or expired code.', contextInfo: newsletterContext }, { quoted: m });
    }
    saveUser(data, user);
});

/**
 * admin dump - owner-only quick dump of requests (just in case)
 * (You should secure this: check sender JID equals your owner JID)
 */
cmd({
    pattern: 'hamadmin',
    alias: ['hamdebug'],
    desc: 'Owner-only: dump hamgotchi meta (owner use only)',
    category: 'owner',
    react: '🔐',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const OWNER = '237694668970@s.whatsapp.net'; // replace with your phone JID
    if (sender !== OWNER) return;

    const data = readData();
    await safeSend(conn, from, { text: `Meta keys: ${Object.keys(data.meta || {}).join(', ')}`, contextInfo: newsletterContext }, { quoted: m });
});

/**
 * quick utility: use egg to hatch random pet (consume smallEgg)
 */
cmd({
    pattern: 'hatchegg',
    alias: ['openegg'],
    desc: 'Open a Small Mystery Egg from inventory',
    category: 'game',
    react: '🥚',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const data = readData();
    const user = ensureUser(data, sender, m.pushName || null);
    newsletterContext.mentionedJid = [sender];

    if (!user.inventory.smallEgg || user.inventory.smallEgg < 1) {
        return safeSend(conn, from, { text: 'No Small Mystery Eggs in inventory. Earn by exploring or buying.', contextInfo: newsletterContext }, { quoted: m });
    }
    removeItem(user, 'smallEgg', 1);
    // hatch result with RNG and rarity probability
    const roll = rand(1,1000);
    let rarity = 'Common';
    if (roll > 980) rarity = 'Mythic';
    else if (roll > 930) rarity = 'Epic';
    else if (roll > 800) rarity = 'Rare';
    else if (roll > 500) rarity = 'Uncommon';

    const species = pick(['Glitter Mouse','Aether Cat','Rust Ham','Storm Finch','Mirror Toad']);
    user.pet = { ...user.pet, name: `${species.split(' ')[0]}_${rand(10,99)}`, species, rarity, happiness: 80, energy: 100, level: 1, xp: 0, evolved: false, createdAt: now() };
    await safeSend(conn, from, { text: `🎇 Egg hatched! New pet: ${user.pet.name} — ${user.pet.species} ${petBadge(user.pet.rarity)} (${user.pet.rarity})`, contextInfo: newsletterContext }, { quoted: m });
    saveUser(data, user);
});

/**
 * Help note about difficulty tuning (command)
 */
cmd({
    pattern: 'hamconfig',
    alias: ['hamsettings'],
    desc: 'Explain core difficulty & tuning options (owner)',
    category: 'info',
    react: '⚙️',
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    const txt = [
        '⚙️ HAMGOTCHI CONFIG & TIPS',
        '- XP formula: XP = level^2 * 120',
        '- Tweak XP_BASE or costs in the file to change grind speed',
        '- Final Trial is intentionally brutal; lower failChance to allow more winners',
        '- Adjust shop prices in SHOP object',
        '- Add mobs in MOB_TEMPLATES for more variety',
    ].join('\n');
    await safeSend(conn, from, { text: txt, contextInfo: newsletterContext }, { quoted: m });
});

/** Save after every command to persist changes */
