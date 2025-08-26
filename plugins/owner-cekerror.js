/*
 * Nama Fitur : Cek Plugin Error
 * Type       : Plugin CJS
 * Author     : Alfat.syah
 */

const fs = require('fs')
const path = require('path')

let handler = async (m, { conn }) => {
  let dir = path.join(__dirname) // folder plugin, sesuaikan kalau beda
  let files = fs.readdirSync(dir).filter(v => v.endsWith('.js'))
  let result = []

  for (let file of files) {
    try {
      delete require.cache[require.resolve(path.join(dir, file))]
      require(path.join(dir, file))
    } catch (err) {
      result.push(`- ${file}`)
    }
  }

  if (result.length === 0) {
    m.reply('✅ Semua plugin aman, tidak ada error.')
  } else {
    let text = `🚩 Ditemukan ${result.length} plugin error:\n\n${result.join('\n')}`
    m.reply(text)
  }
}

handler.command = /^(cekplugin|checkplugin|cpe)$/i
handler.owner = true

module.exports = handler
