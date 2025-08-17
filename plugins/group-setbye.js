let handler = async (m, { args }) => {
    let db = global.db.data.chats[m.chat]
    if (!args[0]) return m.reply("Contoh:\n.goodbye on / .goodbye off")

    if (args[0].toLowerCase() === 'on') {
        db.goodbye = true
        m.reply("✅ Goodbye berhasil diaktifkan!")
    } else if (args[0].toLowerCase() === 'off') {
        db.goodbye = false
        m.reply("❌ Goodbye berhasil dimatikan!")
    } else {
        m.reply("Gunakan: .goodbye on / .goodbye off")
    }
}

handler.help = ['goodbye <on/off>']
handler.tags = ['group']
handler.command = /^goodbye$/i
handler.group = true
handler.admin = true

module.exports = handler
