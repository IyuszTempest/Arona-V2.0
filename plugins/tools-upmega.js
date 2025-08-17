/*
* Nama fitur : Upload Mega.nz (CJS)
* Author : Alfat.syah/F6F411
* yang gak punya akunnya register dulu mega.nz/register
* sumber : https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const { Storage } = require('megajs')
const { sizeFormatter } = require('human-readable')
const path = require('path')

// Akun Mega.nz
const email = `${global.mailowner}`;
const password = `${global.pwmega}`;

// Format ukuran file
const formatSize = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

// Helper buat timestamp
function timeStamp() {
  let d = new Date()
  let y = d.getFullYear()
  let m = String(d.getMonth() + 1).padStart(2, '0')
  let day = String(d.getDate()).padStart(2, '0')
  let hh = String(d.getHours()).padStart(2, '0')
  let mm = String(d.getMinutes()).padStart(2, '0')
  let ss = String(d.getSeconds()).padStart(2, '0')
  return `${y}${m}${day}_${hh}${mm}${ss}`
}

// Upload ke Mega.nz
async function uploadMega(fileName, buffer) {
  const storage = await new Storage({ email, password }).ready
  const file = await storage.upload(fileName, buffer).complete
  return await file.link()
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return m.reply('⚠️ Reply file dengan command *.upmega*')

  let buffer = await q.download()
  if (!buffer) return m.reply('❌ Gagal download file')

  try {
    // Tentukan kategori prefix dari mime
    let prefix = 'File'
    if (mime.startsWith('image/')) prefix = 'Foto'
    else if (mime.startsWith('video/')) prefix = 'Video'
    else if (mime.startsWith('audio/')) prefix = 'Audio'
    else if (mime.includes('javascript')) prefix = 'Script'

    // Ambil ekstensi
    let ext = path.extname(q.filename || '') || ''
    if (!ext && mime.includes('/')) ext = '.' + mime.split('/')[1] // fallback dari mime

    // Bikin nama file unik
    let fileName = `${prefix}_${timeStamp()}${ext}`

    // Size file
    let fileSize = formatSize(buffer.length)

    // Upload
    let link = await uploadMega(fileName, buffer)

    m.reply(
`┏━━━⬣ 📤 Upload ke Mega.nz
┣ 📂 Nama : ${fileName}
┣ 📦 Size : ${fileSize}
┣ 📑 Format : ${ext.replace('.', '').toUpperCase()}
┣ 🔗 Link : ${link}
┗━━━━━━━━⬣`
    )
  } catch (err) {
    m.reply(`❌ Error: ${err.message}`)
    console.error(err)
  }
}

handler.help = ['upmega']
handler.tags = ['tools']
handler.command = /^upmega$/i

module.exports = handler
