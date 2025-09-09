const fs = require('fs')
const fetch = require('node-fetch')
const { sticker5 } = require('../lib/sticker') // wajib ada

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❌ Masukkan teks untuk dibuat stiker brat.\n\nContoh: .brat halo')

  try {
    await m.reply('wait...')

    const url = `https://api.privatezia.biz.id/api/generator/brat?text=${encodeURIComponent(text)}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    const buffer = await res.buffer()

    const stiker = await sticker5(buffer, null, global.packname, global.author)

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    } else {
      throw new Error('Gagal membuat stiker.')
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat memproses permintaan.')
  }
}

handler.help = ['brat <teks>']
handler.tags = ['maker']
handler.command = /^brat$/i
handler.limit = true

module.exports = handler
