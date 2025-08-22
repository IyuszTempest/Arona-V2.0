let handler = async (m, { text }) => {
    if (!text) return m.reply(
        "Contoh:\n.setwelcome Hai @user, selamat datang di @group 🎉\nDeskripsi: @desc"
    )

    let db = global.db.data.chats[m.chat]
    db.welcome = true
    db.setWelcome = text

    m.reply("✅ Pesan welcome berhasil diatur!\n\n" + text)
}

handler.help = ['setwelcome']
handler.tags = ['group']
handler.command = /^setwelcome$/i
handler.group = true
handler.admin = true

module.exports = handler
