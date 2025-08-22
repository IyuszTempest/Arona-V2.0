const axios = require('axios')
const uploadFile = require('../lib/uploadFile')

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply('Balas gambar dengan caption hdr untuk memperjelas foto.')
    }

    await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } })

    const imgBuffer = await q.download()
    const uploadedUrl = await uploadFile(imgBuffer)
    if (!uploadedUrl) throw '❌ Gagal upload gambar.'

    const apiUrl = `https://api.privatezia.biz.id/api/generator/hdr?url=${encodeURIComponent(uploadedUrl)}`
    const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' })

    await conn.sendFile(m.chat, data, 'hdr.jpg', '✅ Gambar berhasil diperjelas (HDR)', m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ Gagal memproses gambar dengan HDR.')
  }
}

handler.help = ['hdr']
handler.tags = ['ai', 'photo']
handler.command = /^hdr$/i

module.exports = handler
