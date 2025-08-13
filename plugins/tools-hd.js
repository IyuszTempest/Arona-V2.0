/* plugins  hd  gacor hd nya.gede bet mb nya
  type cjs
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X */


const axios = require('axios')
const uploadFile = require('../lib/uploadFile')

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ''

    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply('Balas gambar dengan caption *hd*')

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const imgBuffer = await q.download()
    const uploadedUrl = await uploadFile(imgBuffer)
    if (!uploadedUrl) throw '❌ Gagal upload gambar.'

    const apiUrl = `https://api.privatezia.biz.id/api/generator/hd?url=${encodeURIComponent(uploadedUrl)}`
    const response = await axios.get(apiUrl)
    if (!response.data?.status || !response.data?.result_url) throw '❌ Gagal mendapatkan hasil HD.'

    const image = await axios.get(response.data.result_url, { responseType: 'arraybuffer' })

    await conn.sendFile(m.chat, image.data, 'hd.jpg', '✅ Berhasil meningkatkan kualitas gambar (HD)', m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ Gagal membuat gambar HD.')
  }
}

handler.help = ['hd']
handler.tags = ['ai', 'tools']
handler.command = /^hd$/i

module.exports = handler