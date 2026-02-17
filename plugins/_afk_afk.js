/**
 * @ 💤 AFK Mode - Command
 **/

let handler = async (m, { text, conn }) => {
  let user = global.db.data.users[m.sender]
  user.afk = +new Date()
  user.afkReason = text.trim()
  let senderName = m.pushName || m.sender.split('@')[0]

  let caption = `
┏━━━━━━━⬣  *A F K  M O D E*
┃
┃ ⚡ *Status:* Active
┃ 👤 *Sensei:* ${senderName}
┃ 🕒 *Time:* ${new Date().toLocaleString('id-ID')} WIB
┃ 📝 *Reason:* ${text.trim() ? text.trim() : 'Nggak ada alasan, lagi ke isekai ntar.'}
┃
┗━━━━━━━━━━━━━━━━━━⬣

> *“Euphy akan memantau semua pesan masuk. Silakan istirahat dengan tenang! ✨”*
  `.trim()

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: "EUPHY SYSTEM: AFK ACTIVATED",
        body: `${senderName} sedang istirahat`,
        thumbnailUrl: global.menuimg, // Ganti link foto Elaina favoritmu
        sourceUrl: "afk.com",
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['afk [alasan]']
handler.tags = ['main']
handler.command = /^afk$/i

module.exports = handler
