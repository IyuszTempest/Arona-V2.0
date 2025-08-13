let fetch = require('node-fetch')

let handler = async (m, { conn, args, usedPrefix, command }) => {
   if (!args[0]) throw `*Contoh:* ${usedPrefix}${command} https://www.mediafire.com/file/ek2twngmwqsyq2m/DeviantCrashV6.zip/file`

   if (!args[0].includes('mediafire.com')) {
       throw `*URL Mediafire tidak valid!*`
   }

   await m.reply(wait)

   try {
       const api = await fetch(`https://api.privatezia.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`)
       const res = await api.json()

       if (!res.status || !res.result?.url) {
           throw 'Gagal mengambil data dari Mediafire.'
       }

       const { title, link, url, size } = res.result
       const caption = `*MEDIAFIRE DOWNLOADER*\n\n📦 Judul: ${title}\n📁 Ukuran: ${size}\n🔗 Link: ${link}\n\n_Mengirim file..._`

       await conn.sendFile(m.chat, url, title + '.zip', caption, m)
   } catch (err) {
       console.error(err)
       throw '⚠️ Terjadi kesalahan saat mengunduh file dari Mediafire.'
   }
}

handler.help = ['mediafire3'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(mediafire3|mf3(dl)?)$/i
handler.limit = true

module.exports = handler