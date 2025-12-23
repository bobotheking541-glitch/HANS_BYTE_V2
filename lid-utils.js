// lid-utils.fixed.js (final, fully patched)
// Supports: @lid suffix, bare-string files, arrays, objects, reversed mappings
// Includes robust owner normalization so numeric OWNER_NUM entries match resolved JIDs

const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.resolve(__dirname, 'sessions');

// stricter JID detection: only treat known whatsapp domains as canonical JIDs
function _isJidLike(s) {
  if (!s || typeof s !== 'string') return false;
  return /@(s\.whatsapp\.net|g\.us|c\.us)$/i.test(s);
}

function _isLikelyLid(s) {
  if (!s) return false;
  const str = String(s);
  return /^\d{6,}$/.test(str);
}

// load and merge lid mapping files from sessions/
function loadLidMappings() {
  const lidsToJid = new Map();
  const jidToLid = new Map();

  if (!fs.existsSync(SESSIONS_DIR)) return { lidsToJid, jidToLid };

  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.startsWith('lid-mapping'));
  for (const f of files) {
    const full = path.join(SESSIONS_DIR, f);
    let raw;
    try {
      raw = fs.readFileSync(full, 'utf8');
    } catch (e) {
      console.warn(`[lid-utils] failed to read ${f}:`, e.message);
      continue;
    }

    if (!raw || !raw.trim()) continue;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      const bare = raw.trim();
      if (bare) parsed = bare;
      else {
        console.warn(`[lid-utils] failed to parse ${f}: ${e.message}`);
        continue;
      }
    }

    const record = (lid, jid) => {
      if (!lid || !jid) return;
      const L = String(lid);
      const J = String(jid);
      lidsToJid.set(L, J);
      jidToLid.set(J, L);
    };

    // parsed = string/number (common Baileys shape: file contains the LID string)
    if (typeof parsed === 'string' || typeof parsed === 'number') {
      const lid = String(parsed);
      const base = f.replace(/^lid-mapping-?/, '').replace(/\.json$/i, '');
      const jid = base.includes('@') ? base : `${base}@s.whatsapp.net`;
      record(lid, jid);
      continue;
    }

    // parsed = array
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (!entry) continue;
        if (typeof entry === 'string' || typeof entry === 'number') {
          const lid = String(entry);
          const base = f.replace(/^lid-mapping-?/, '').replace(/\.json$/i, '');
          const jid = base.includes('@') ? base : `${base}@s.whatsapp.net`;
          record(lid, jid);
        } else if (typeof entry === 'object') {
          const e = entry;
          if (e.lid && e.jid) record(e.lid, e.jid);
          else {
            const [k, v] = Object.entries(e)[0] || [];
            if (_isJidLike(k) && _isLikelyLid(v)) record(v, k);
            else if (_isJidLike(v) && _isLikelyLid(k)) record(k, v);
          }
        }
      }
      continue;
    }

    // parsed = object
    if (typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        if (k == null || v == null) continue;
        const key = String(k);
        const val = String(v);

        if (_isJidLike(key) && _isLikelyLid(val)) {
          record(val, key);
          continue;
        }

        if (_isJidLike(val) && _isLikelyLid(key)) {
          record(key, val);
          continue;
        }

        if (_isLikelyLid(key) && !_isLikelyLid(val)) {
          const jid = _isJidLike(val) ? val : (/_?\d{6,}/.test(val) ? `${val}@s.whatsapp.net` : null);
          if (jid) record(key, jid);
          else lidsToJid.set(key, val);
          continue;
        }

        if (_isLikelyLid(val) && !_isLikelyLid(key)) {
          const jid = _isJidLike(key) ? key : (/_?\d{6,}/.test(key) ? `${key}@s.whatsapp.net` : null);
          if (jid) record(val, jid);
          else lidsToJid.set(val, key);
          continue;
        }

        // fallback store
        lidsToJid.set(key, val);
      }
    }
  }

  return { lidsToJid, jidToLid };
}

// normalize sender and resolve lids to jids
function resolveToJid(sender, maps = null, { assumeDomain = 's.whatsapp.net' } = {}) {
  if (!sender) return null;
  if (!maps) maps = loadLidMappings();
  const { lidsToJid } = maps;
  const sraw = String(sender);

  // If sender has a domain that's not a known whatsapp domain, treat as lid-like
  const domainMatch = sraw.match(/^(.*)@([^@]+)$/);
  if (domainMatch) {
    const [, local, domain] = domainMatch;
    if (!/^(s\.whatsapp\.net|g\.us|c\.us)$/i.test(domain)) {
      // try exact with domain
      if (lidsToJid.has(sraw)) return lidsToJid.get(sraw);
      // try without domain
      if (lidsToJid.has(local)) return lidsToJid.get(local);
      // cleaned local
      const cleanedLocal = local.replace(/^lid:|^~|^0+/, '').replace(/[^0-9a-zA-Z]/g, '');
      if (lidsToJid.has(cleanedLocal)) return lidsToJid.get(cleanedLocal);
      // fallback numeric -> assume whatsapp domain
      if (/^\d{6,15}$/.test(cleanedLocal)) return `${cleanedLocal}@${assumeDomain}`;
    }
  }

  // if it's a canonical whatsapp jid, return it
  if (_isJidLike(sraw)) return sraw;

  // exact mapping
  if (lidsToJid.has(sraw)) return lidsToJid.get(sraw);

  // cleaned variants
  const cleaned = sraw.replace(/^lid:|^~|^0+/, '').replace(/[^0-9a-zA-Z]/g, '');
  if (lidsToJid.has(cleaned)) return lidsToJid.get(cleaned);

  // numeric fallback
  if (/^\d{6,15}$/.test(cleaned)) return `${cleaned}@${assumeDomain}`;

  return null;
}

// returns true if resolved sender is in owners array
function isOwnerResolved(sender, owners = [], maps = null) {
  if (!Array.isArray(owners)) owners = [owners];
  if (!maps) maps = loadLidMappings();

  // prefer resolved JID (handles @lid and other weird formats)
  const maybeJid = resolveToJid(sender, maps);
  const candidateJid = maybeJid || (_isJidLike(String(sender)) ? String(sender) : null);
  if (!candidateJid) return false;
  const canon = String(candidateJid).toLowerCase();

  // normalize owners list to canonical jids
  const normalizedOwners = owners
    .filter(Boolean)
    .map(o => {
      const s = String(o).trim();
      if (!s) return null;
      if (_isJidLike(s)) return s.toLowerCase();
      // numeric-only owner -> assume whatsapp domain
      if (/^\d{6,15}$/.test(s)) return `${s}@s.whatsapp.net`;
      return s.toLowerCase();
    })
    .filter(Boolean);

  return normalizedOwners.some(o => o === canon);
}

// helper to merge and write a single mapping file (optional)
function mergeAndWriteMapping(outputName = 'lid-mapping-merged.json') {
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  const maps = loadLidMappings();
  const obj = {};
  for (const [lid, jid] of maps.lidsToJid.entries()) obj[lid] = jid;
  const outPath = path.join(SESSIONS_DIR, outputName);
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2), 'utf8');
  return outPath;
}

module.exports = {
  loadLidMappings,
  resolveToJid,
  isOwnerResolved,
  mergeAndWriteMapping,
};
