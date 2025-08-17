let handler = async (m, { args }) => {
    let db = global.db.data.chats[m.chat]
    if (!args[0]) return m.reply("Contoh:\n.welcome on / .welcome off")

    if (args[0].toLowerCase() === 'on') {
        db.welcome = true
        m.reply("✅ Welcome berhasil diaktifkan!")
    } else if (args[0].toLowerCase() === 'off') {
        db.welcome = false
        m.reply("❌ Welcome berhasil dimatikan!")
    } else {
        m.reply("Gunakan: .welcome on / .welcome off")
    }
}

handler.help = ['welcome <on/off>']
handler.tags = ['group']
handler.command = /^welcome$/i
handler.group = true
handler.admin = true

module.exports = handler