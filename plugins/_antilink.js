let handler = m => m

let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
handler.before = async function (m, { conn, user, isBotAdmin, isAdmin }) {
  if ((m.isBaileys && m.fromMe) || m.fromMe || !m.isGroup) return true
  let chat = global.db.data.chats[m.chat]
  let isGroupLink = linkRegex.exec(m.text)

  if (chat.antiLink && isGroupLink) {
    // Cek dulu apakah botnya admin atau bukan, karena buat hapus pesan butuh akses admin.
    if (!isBotAdmin) return m.reply('*「 ANTI LINK 」*\n\nBot bukan admin, jadi tidak bisa menghapus pesan link _-*')

    // Pengecualian untuk admin, pesannya tidak akan dihapus.
    if (isAdmin) return m.reply('*Eh sorry, karena kamu admin, linknya gak akan dihapus. hehe..*')

    // Pengecualian untuk link grup itu sendiri.
    let linkGC = ('https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat))
    let isLinkconnGc = new RegExp(linkGC, 'i')
    let isgclink = isLinkconnGc.test(m.text)
    if (isgclink) return m.reply('*「 ANTI LINK 」*\n\nOke, link tidak akan dihapus karena itu link grup ini sendiri.*')
    
    // Kirim peringatan dan hapus pesan
    await m.reply(`*「 ANTI LINK 」*\n\nTerdeteksi *${await conn.getName(m.sender)}* mengirim link grup!\n\nMaaf, dilarang mengirim link grup lain. Pesanmu akan dihapus.`)
    
    // Perintah untuk menghapus pesan yang berisi link
    await conn.sendMessage(m.chat, { delete: m.key })
    
    // Perintah untuk KICK member DIHILANGKAN/DIHAPUS
    // await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
  }
  return true
}

module.exports = handler