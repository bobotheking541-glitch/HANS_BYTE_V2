const { cmd } = require('../command');

cmd({
  pattern: "person",
  react: "👤",
  alias: ["userinfo", "whois", "profile"],
  desc: "Get complete user profile information",
  category: "utility",
  use: '.person [@tag or reply]',
  filename: __filename
},
async (conn, mek, m, { from, sender, args, isGroup, reply }) => {
  try {
    console.log('--- person command start ---');
    console.log('Raw sender:', sender);
    console.log('Raw args:', args);

    // 1) Determine target JID (mentioned -> quoted -> args -> sender)
    let target = null;
    try {
      if (m?.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
        console.log('[step] using mentionedJid:', target);
      } else if (m?.quoted && m.quoted.sender) {
        target = m.quoted.sender;
        console.log('[step] using quoted.sender:', target);
      } else if (args && args[0]) {
        const num = args[0].replace(/[^0-9]/g, '');
        target = (num ? num + '@s.whatsapp.net' : sender);
        console.log('[step] using args -> target:', target);
      } else {
        target = sender;
        console.log('[step] defaulting to sender:', target);
      }
    } catch (err) {
      console.warn('[warn] error while determining target jid:', err);
      target = sender;
    }

    // Helper to safely check property
    const safeGetStoreContacts = () => {
      if (conn.store && conn.store.contacts) return conn.store.contacts;
      if (conn.contacts) return conn.contacts; // some setups expose conn.contacts
      return null;
    };

    // 2) If it's @lid, try multiple resolution strategies
    const isLid = typeof target === 'string' && target.endsWith('@lid');
    if (isLid) {
      console.log('[step] target looks like @lid:', target);

      // 2a) Try conn.onWhatsApp() — new Baileys method
      try {
        if (typeof conn.onWhatsApp === 'function') {
          console.log('[try] calling conn.onWhatsApp(...)');
          const res = await conn.onWhatsApp(target).catch(e => {
            console.warn('[warn] conn.onWhatsApp threw:', e && e.message ? e.message : e);
            return [];
          });
          console.log('[debug] onWhatsApp result:', res);
          if (Array.isArray(res) && res.length > 0 && res[0]?.jid) {
            console.log('[ok] onWhatsApp resolved to', res[0].jid);
            target = res[0].jid;
          } else {
            console.log('[info] onWhatsApp did not resolve @lid');
          }
        } else {
          console.log('[info] conn.onWhatsApp not available on this conn object');
        }
      } catch (err) {
        console.warn('[warn] onWhatsApp step failed:', err);
      }

      // 2b) If still unresolved, try scanning conn.store.contacts for a contact that has lid metadata
      if (target.endsWith('@lid')) {
        try {
          const storeContacts = safeGetStoreContacts();
          if (storeContacts) {
            console.log('[try] scanning local store.contacts for .lid link');
            // storeContacts may be a Map or plain object
            if (typeof storeContacts.entries === 'function') {
              for (const [k, v] of storeContacts.entries()) {
                // v might be object containing .lid or v?.lid or v?.contact?.lid depending on how store is shaped
                if (!v) continue;
                if (v?.lid === target || v?.contact?.lid === target || v?.key?.id === target) {
                  console.log('[ok] found mapping in store.contacts:', k);
                  target = k;
                  break;
                }
                // some stores store lid as property on contact inside object
                if (v?.ids && Array.isArray(v.ids)) {
                  if (v.ids.includes(target)) {
                    console.log('[ok] found mapping via v.ids ->', k);
                    target = k;
                    break;
                  }
                }
              }
            } else {
              // plain object
              for (const k of Object.keys(storeContacts)) {
                const v = storeContacts[k];
                if (!v) continue;
                if (v?.lid === target || v?.contact?.lid === target) {
                  console.log('[ok] found mapping in store.contacts (obj):', k);
                  target = k;
                  break;
                }
              }
            }
          } else {
            console.log('[info] no local contact store found (conn.store.contacts / conn.contacts)');
          }
        } catch (err) {
          console.warn('[warn] scanning store.contacts failed:', err);
        }
      }

      // 2c) Try decodeJid or jidDecode helpers if available on conn
      if (target.endsWith('@lid')) {
        try {
          if (typeof conn.decodeJid === 'function') {
            console.log('[try] calling conn.decodeJid(...)');
            const dec = conn.decodeJid(target);
            console.log('[debug] decodeJid result:', dec);
            // decodeJid often returns normalized jid map; use the returned value if it's a string
            if (typeof dec === 'string' && dec) {
              console.log('[ok] decodeJid produced string ->', dec);
              target = dec;
            }
          } else if (typeof conn.jidDecode === 'function') {
            console.log('[try] calling conn.jidDecode(...)');
            const dec2 = conn.jidDecode(target);
            console.log('[debug] jidDecode result:', dec2);
            if (dec2?.user) {
              target = `${dec2.user}@${dec2.server || 's.whatsapp.net'}`;
              console.log('[ok] jidDecode ->', target);
            }
          } else {
            console.log('[info] no decodeJid/jidDecode helpers available on conn');
          }
        } catch (err) {
          console.warn('[warn] decodeJid/jidDecode attempt failed:', err);
        }
      }

      // final note if unresolved
      if (target.endsWith('@lid')) {
        console.log('[final] could not resolve @lid -> proceeding with original @lid (limited info may be available)');
      }
    } // end @lid resolution

    // 3) Ensure target is a JID string
    if (!target || typeof target !== 'string') {
      console.warn('[fatal] target is not a string; falling back to sender');
      target = sender;
    }
    if (!target.includes('@')) {
      target = target + '@s.whatsapp.net';
    }

    console.log('[info] final target JID to use:', target);

    // 4) Safely fetch data (profile picture, status, contact info) — each in own try/catch
    let ppUrl = null;
    try {
      if (typeof conn.profilePictureUrl === 'function') {
        ppUrl = await conn.profilePictureUrl(target, 'image').catch(() => null);
        console.log('[info] profile picture url:', ppUrl);
      } else {
        console.log('[info] conn.profilePictureUrl not available');
      }
    } catch (err) {
      console.warn('[warn] profilePictureUrl failed:', err);
      ppUrl = null;
    }

    let statusObj = null;
    try {
      if (typeof conn.fetchStatus === 'function') {
        statusObj = await conn.fetchStatus(target).catch(() => null);
        console.log('[info] fetchStatus result:', statusObj ? '[has status]' : '[no status]');
      } else {
        console.log('[info] conn.fetchStatus not available');
      }
    } catch (err) {
      console.warn('[warn] fetchStatus failed:', err);
      statusObj = null;
    }

    // 5) Try to get a name from multiple sources
    let contactName = 'Unknown';
    try {
      // prefer conn.store or conn.contacts
      const storeContacts = safeGetStoreContacts();
      if (storeContacts) {
        let entry = null;
        if (typeof storeContacts.get === 'function') {
          entry = storeContacts.get(target);
        } else {
          entry = storeContacts[target];
        }
        console.log('[debug] store contact entry:', entry ? '[found]' : '[not found]');
        if (entry) {
          // entry might have notify, name, vname, pushname, etc.
          contactName = entry.notify || entry.vname || entry.name || entry.pushname || contactName;
        }
      } else if (conn.contacts && conn.contacts[target]) {
        const e = conn.contacts[target];
        contactName = e.notify || e.name || contactName;
      } else {
        console.log('[info] contact store not available or entry missing');
      }

      // try presence/pushname fallback
      if ((contactName === 'Unknown' || !contactName) && typeof conn.presenceSubscribe === 'function') {
        try {
          const pres = await conn.presenceSubscribe(target).catch(() => null);
          console.log('[debug] presenceSubscribe result:', pres);
          if (pres?.pushname) contactName = pres.pushname;
        } catch (e) {
          console.warn('[warn] presenceSubscribe fallback failed:', e);
        }
      }
    } catch (err) {
      console.warn('[warn] name resolution error:', err);
    }
    console.log('[info] final contact name:', contactName);

    // 6) Group role (if in group and participants passed in message object)
    let groupRole = 'N/A';
    try {
      if (isGroup && m?.participants) {
        const participants = m.participants;
        const p = Array.isArray(participants) ? participants.find(x => x.id === target) : null;
        if (p) groupRole = p.admin ? (p.admin === 'superadmin' ? '👑 Super Admin' : '🛡️ Admin') : '👤 Member';
      } else if (isGroup && typeof conn.groupMetadata === 'function') {
        // fallback: try to get group metadata (not always necessary)
        groupRole = 'Unknown (group)';
      } else {
        groupRole = 'Not in a group';
      }
    } catch (err) {
      console.warn('[warn] group role detection failed:', err);
    }

    // 7) Prepare output text
    const numberDisplay = target.replace(/@.+$/, '');
    const aboutText = statusObj?.status || 'No bio/status available';
    const updatedAt = statusObj?.setAt ? new Date(statusObj.setAt * 1000).toISOString() : 'N/A';
    const accountType = (typeof conn.isBusiness === 'function' && (await conn.isBusiness?.(target).catch(() => false))) ? 'Business' : 'Personal';

    const caption = [
      `*GC MEMBER INFORMATION 🧊*`,
      ``,
      `📛 *Name:* ${contactName}`,
      `🔢 *Number (raw):* ${numberDisplay}`,
      `📌 *Account Type:* ${accountType}`,
      ``,
      `*📝 About:*`,
      `${aboutText}`,
      ``,
      `*⚙️ Account Info:*`,
      `✅ Registered: unknown (API limited)`,
      `👥 *Group Role:* ${groupRole}`,
      `📌 *Resolved JID:* ${target}`,
    ].join('\n');

    // 8) Send result (image if available, otherwise text)
    try {
      if (ppUrl) {
        await conn.sendMessage(from, { image: { url: ppUrl }, caption, mentions: [target] }, { quoted: mek }).catch(async (e) => {
          console.warn('[warn] sendMessage with image failed, falling back to text:', e && e.message ? e.message : e);
          await conn.sendMessage(from, { text: caption, mentions: [target] }, { quoted: mek }).catch(err => {
            console.error('[err] final sendMessage failed:', err);
          });
        });
      } else {
        await conn.sendMessage(from, { text: caption, mentions: [target] }, { quoted: mek }).catch(err => {
          console.error('[err] sendMessage(text) failed:', err);
        });
      }
      console.log('[ok] person info sent.');
    } catch (err) {
      console.error('[err] sending message failed:', err);
      try { await reply(`❌ Error sending profile: ${err.message || err}`); } catch (_) {}
    }

    console.log('--- person command end ---');
  } catch (err) {
    console.error('❌ Person command top-level error:', err);
    try { await reply(`❌ Error: ${err.message || err}`); } catch (_) {}
  }
});
