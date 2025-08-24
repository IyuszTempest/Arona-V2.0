/*
* Nama Fitur : Upload File ke idnet.my.id (Fast, No Expired)
* Type       : Plugin CJS
* Author     : Alfat.syah
*/

const fetch = require('node-fetch')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')

let handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!mime) throw '🚩 Reply image/video/file yang mau diupload!'

  await conn.sendMessage(m.chat, {
    react: {
      text: '⚡',
      key: m.key,
    }
  })

  try {
    const media = await q.download()
    const sizeKB = (media.length / 1024).toFixed(2) // Size in KB
    const { ext } = await fromBuffer(media)

    const bodyForm = new FormData()
    bodyForm.append("file", media, "file." + ext)

    const response = await fetch("https://file.idnet.my.id/api/upload.php", {
      method: "POST",
      body: bodyForm
    })

    const result = await response.json()

    if (result?.file?.url) {
      const url = result.file.url
      const sizeInfo = sizeKB >= 1024 ? (sizeKB / 1024).toFixed(2) + ' MB' : sizeKB + ' KB'

      await m.reply(
        `✅ **Upload Berhasil!**\n\n` +
        `📂 Nama File : file.${ext}\n` +
        `📦 Size : ${sizeInfo}\n` +
        `⏳ Expired : Tidak ada kadaluarsa\n` +
        `🔗 URL : ${url}`
      )
    } else {
      throw 'Gagal upload, coba lagi!'
    }
  } catch (err) {
    console.error(err)
    m.reply('❌ Terjadi kesalahan saat upload file!')
  }
}

handler.command = /^toidnet$/i
handler.help = ['toidnet (reply media)']
handler.tags = ['tools']

module.exports = handler
