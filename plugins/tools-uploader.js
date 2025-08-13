const uploadImage = require('../lib/uploadFile')

const handler = async (m) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  
  if (!mime) throw '🚩 Reply image/video!'
  
  await conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  });

  try {
    const media = await q.download()
    
    const isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime)
    
    const link = await uploadImage(media)
    
    m.reply(`${link}
${media.length} Byte(s)
${isTele ? '(Tidak Ada Tanggal Kedaluwarsa)' : '(Tidak diketahui)'}`)
  } catch (error) {
    console.error('Upload error:', error)
    m.reply('Gagal mengunggah file')
  }
}

handler.help = ['tourl <reply image>']
handler.tags = ['tools']
handler.command = /^(upload|tourl)$/i

module.exports = handler