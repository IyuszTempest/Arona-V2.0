/**
 * @ 💤 AFK Detector - Handler
 **/

let handler = m => m

handler.before = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  // Filter biar nggak error pas dapet pesan sistem
  if (!m.text && !m.message && !m.msg) return true
  if (m.mtype === 'reactionMessage' || m.mtype === 'protocolMessage') return true

  // 1. WELCOME BACK (User kirim chat saat masih AFK)
  if (user && user.afk > -1) {
    let afkDuration = new Date() - user.afk
    let welcome = `
✨ *A F K  O F F* ✨
━━━━━━━━━━━━━━━━━━━━━━

*Okaerinasai, ${m.pushName || 'User'}!*

📊 *Data Sesi Terakhir:*
•── *Durasi:* ${clockString(afkDuration)}
•── *Alasan:* ${user.afkReason ? user.afkReason : 'Tanpa alasan'}

> *“Senang melihatmu kembali. Euphy siap menerima perintah lagi! 🌸”*
    `.trim()

    await conn.reply(m.chat, welcome, m)
    user.afk = -1
    user.afkReason = ''
  }

  // 2. MENTION DETECTOR (Ada yang ngetag orang AFK)
  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
  for (let jid of jids) {
    if (jid === m.sender) continue
    let mentionedUser = global.db.data.users[jid]
    if (!mentionedUser || mentionedUser.afk < 0) continue

    let afkTime = mentionedUser.afk
    let reason = mentionedUser.afkReason || 'Tanpa keterangan'
    let afkDuration = new Date() - afkTime

    let notify = `
╭━━〔 ⚠️ *U S E R  A F K* 〕━━
┃
┃ 👤 *User:* ${conn.getName(jid)}
┃ 🕒 *Since:* ${clockString(afkDuration)} ago
┃ 💬 *Pesan:* ${reason}
┃
╰━━━━━━━━━━━━━━━⬣

> *“Ssstt! Orangnya lagi nggak ada. Jangan di-spam ya, nanti Euphy jewer! 💢”*
    `.trim()

    await conn.reply(m.chat, notify, m)
  }
  return true
}

module.exports = handler

function clockString(ms) {
  let h = isNaN(ms) ? 0 : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? 0 : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? 0 : Math.floor(ms / 1000) % 60
  
  let res = []
  if (h > 0) res.push(`${h}j`)
  if (m > 0) res.push(`${m}m`)
  res.push(`${s}s`)
  return res.join(' ')
}
