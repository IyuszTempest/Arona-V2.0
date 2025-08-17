let handler = async (m, { text }) => {
    if (!text) return m.reply(
        "Contoh:\n.setgoodbye Selamat tinggal @user 👋, semoga betah di luar @group ✨"
    )

    let db = global.db.data.chats[m.chat]
    db.goodbye = true
    db.goodbyeText = text

    m.reply("✅ Pesan goodbye berhasil diatur!\n\n" + text)
}

handler.help = ['setgoodbye']
handler.tags = ['group']
handler.command = /^setgoodbye$/i
handler.group = true
handler.admin = true

module.exports = handler
