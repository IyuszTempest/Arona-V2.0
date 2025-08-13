let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
    if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya dapat digunakan oleh admin grup.")
    
    global.db.data.chats = global.db.data.chats || {}
    
    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {}
    }
    
    if (!args[0]) return m.reply("Silakan gunakan: .antibot on/off")
    
    if (args[0] === "on") {
        if (global.db.data.chats[m.chat].antibot) return m.reply("Fitur Anti Bot sudah aktif di grup ini.")
        global.db.data.chats[m.chat].antibot = true
        return m.reply("Anti Bot berhasil diaktifkan dalam grup ini.")
    } else if (args[0] === "off") {
        if (!global.db.data.chats[m.chat].antibot) return m.reply("Fitur Anti Bot sudah nonaktif di grup ini.")
        global.db.data.chats[m.chat].antibot = false
        return m.reply("Anti Bot berhasil dinonaktifkan dalam grup ini.")
    } else {
        return m.reply("Mohon pilih opsi yang valid: on/off")
    }
}

handler.before = async (m, { conn, isBotAdmin }) => {
    global.db.data.chats = global.db.data.chats || {}
    if (!global.db.data.chats[m.chat]) return
    if (!global.db.data.chats[m.chat].antibot) return
    if (!m.isGroup) return

    const senderNumber = m.sender.split("@")[0]

    // Deteksi bot sederhana (bisa dikembangkan sesuai bot)
    const isBot = m.key.fromMe === false && /bot/i.test(senderNumber)

    if (!isBot) return

    if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
        await conn.sendMessage(m.chat, { text: @${senderNumber} telah dikeluarkan karena terdeteksi bot., mentions: [m.sender] })
    } else {
        await conn.sendMessage(m.chat, { delete: m.key })
    }
}

handler.command = ['antibot']
handler.help = ['antibot'].map(a => a + ' on/off')
handler.tags = ['group']
handler.group = true
handler.admin = true

module.exports = handler
