/*
*[ Plugin List Online (Mayan Akurat) ]*
*[ Sumber ]*
https://whatsapp.com/channel/0029Vafs40K4dTnIXMqfQa2Q
*[ Created by ]*
OwnBlox
*/

let handler = async (m, { conn, args }) => {
  let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat
  if (!global.onlineUsers) global.onlineUsers = {}
  if (!global.onlineUsers[id]) global.onlineUsers[id] = {}
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
    await conn.presenceSubscribe(id)
    const participants = await conn.groupMetadata(id).then(res => res.participants)
    await Promise.all(participants.map(p => conn.presenceSubscribe(p.id).catch(() => {})))
    await new Promise(r => setTimeout(r, 3000))
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    showOnlineUsers(conn, m, id)
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m)
  }
}

async function showOnlineUsers(conn, m, groupId) {
  const oneMinuteAgo   = Date.now() - 60 * 1000
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const onlineList     = []
  const maybeList      = []

  for (const user in global.onlineUsers[groupId] || {}) {
    if (!user.endsWith('@s.whatsapp.net')) {
      delete global.onlineUsers[groupId][user]
      continue
    }
    const t = global.onlineUsers[groupId][user]
    if (t > oneMinuteAgo)       onlineList.push(user)
    else if (t > fiveMinutesAgo) maybeList.push(user)
    else                         delete global.onlineUsers[groupId][user]
  }

  let txt = ''
  if (onlineList.length) {
    txt += '┌─〔 Pengguna Online 〕\n'
      + onlineList.map(v => '├ @' + v.split('@')[0].replace(/[\u200E\u200F\u2066-\u2069]/g, '')).join('\n')
      + '\n└────\n\n'
  }
  if (maybeList.length) {
    txt += '┌─〔 Mungkin Online (5m) 〕\n'
      + maybeList.map(v => '├ @' + v.split('@')[0].replace(/[\u200E\u200F\u2066-\u2069]/g, '')).join('\n')
      + '\n└────'
  }

  if (txt) {
    conn.reply(m.chat, txt.trim(), m, { contextInfo: { mentionedJid: [...onlineList, ...maybeList] } })
  } else {
    conn.reply(m.chat, 'Tidak ada pengguna online yang terdeteksi', m)
  }
}

function setupPresenceListener(conn) {
  if (global._presenceListenerSet) return
  global._presenceListenerSet = true

  conn.ev.on('presence.update', ({ id, presences }) => {
    const isGroup = id.endsWith('@g.us')
    if (!global.onlineUsers) global.onlineUsers = {}
    if (isGroup) {
      if (!global.onlineUsers[id]) global.onlineUsers[id] = {}
      for (const [u, p] of Object.entries(presences))
        if (p === 'available') global.onlineUsers[id][u] = Date.now()
    } else {
      for (const gid in global.onlineUsers)
        if (presences[id] === 'available')
          global.onlineUsers[gid][id] = Date.now()
    }
  })

  conn.ev.on('messages.upsert', ({ messages }) => {
    if (!global.onlineUsers) global.onlineUsers = {}
    for (const msg of messages) {
      if (!msg.key?.remoteJid) continue
      if (!msg.key.participant) continue
      const chatId   = msg.key.remoteJid
      const senderId = msg.key.participant
      if (!chatId.endsWith('@g.us')) continue
      if (!global.onlineUsers[chatId]) global.onlineUsers[chatId] = {}
      global.onlineUsers[chatId][senderId] = Date.now()
    }
  })
}

setupPresenceListener(global.conn)

handler.help    = ['listonline','liston']
handler.tags    = ['group']
handler.command = /^(liston(line)?)/i
handler.group   = true

module.exports = handler