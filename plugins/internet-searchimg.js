/* 
• Plugins Reverse Image Search
• Info: mencari gambar serupa
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l/1108
*/

const axios = require ('axios')
const uploadImage = require ('../lib/uploadImage.js')

let handler = async (m, { conn }) => {
  let imgBuffer = null

  if (m.quoted && m.quoted.download) {
    imgBuffer = await m.quoted.download()
  } else if (m.download) {
    imgBuffer = await m.download()
  } else {
    return m.reply('Kirim atau reply gambar dengan command .searchimg')
  }

  await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } })

  try {
    const url = await uploadImage(imgBuffer)

    const api = `https://picdetective.com/api/search?url=${encodeURIComponent(url)}&search_type=exact_matches`
    const res = await axios.get(api, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
        'Referer': 'https://picdetective.com/search'
      }
    })

    let results = res.data.matches || []
    if (!results.length) results = res.data.exact_matches || []

    results = await Promise.all(results.map(async item => {
      if (item.thumbnail && item.thumbnail.startsWith('data:image')) {
        try {
          const base64Data = item.thumbnail.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const thumbUrl = await uploadImage(buffer)
          item.thumbnail = thumbUrl
        } catch {
          item.thumbnail = 'Gagal upload thumbnail'
        }
      }
      return item
    }))

    if (!results.length) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('Tidak ditemukan hasil pencarian untuk gambar ini.')
    }

    const teks = results.map(item => {
      return `🔎 *Posisi:* ${item.position || '-'}
📌 *Judul:* ${item.title || '-'}
🌐 *Link:* ${item.link || '-'}
📍 *Sumber:* ${item.source || '-'}
🖼️ *Thumbnail:* ${item.thumbnail || '-'}
🕒 *Info:* ${(item.extensions && item.extensions.join(' | ')) || '-'}
──────────────`
    }).join('\n\n')

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await m.reply(teks)

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Terjadi kesalahan saat mencari gambar.')
  }
}

handler.command = /^searchimg$/i
handler.help = ['searchimg']
handler.tags = ['tools','image','internet','ai']
handler.limit = 5

module.exports = handler;