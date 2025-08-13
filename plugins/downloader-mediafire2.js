
/*
📌 Nama Fitur: Mediafire downloader
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VbB7ffQGk1Fm9QDRsq3e
✍️ Convert By ZenzXD
*/
const cheerio = require ('cheerio')
const fetch = require ('undici')
const lookup = require ('mime-types')
const handler = async (m, { conn, text }) => {
if (!text) {
return m.reply('*Contoh:* .mediafire <url>\n\nKirimkan link mediafire yang valid.')
}
if (!/^https?:\/\/(www\.)?mediafire\.com/.test(text)) {
return m.reply('Link MediaFire tidak valid!')
}
try {
const res = await fetch(`https://rianofc-bypass.hf.space/scrape?url=${encodeURIComponent(text)}`)
const html = await res.json()
const $ = cheerio.load(html.html)
const filename = $('.dl-info').find('.intro .filename').text().trim()
const type = $('.dl-btn-label').find('.filetype > span').text().trim()
const size = $('.details li:contains("File size:") span').text().trim()
const uploaded = $('.details li:contains("Uploaded:") span').text().trim()
const ext = /\.(.*?)/.exec($('.dl-info').find('.filetype > span').eq(1).text())?.[1]?.trim() || 'bin'
const mimetype = lookup(ext.toLowerCase()) || 'application/octet-stream'
const download = $('.input').attr('href')
if (!download) throw new Error('Gagal mendapatkan link download.')
await m.reply(`*MEDIAFIRE DOWNLOADER*\n\n• *Nama:* ${filename}\n• *Tipe:* ${type}\n• *Ukuran:* ${size}\n• *Upload:* ${uploaded}\n• *MIME:* ${mimetype}\n\n_Mengirim file..._`)
await conn.sendFile(m.chat, download, filename, null, m)
} catch (e) {
console.error(e)
m.reply('Gagal mengambil data dari MediaFire. Pastikan link valid dan coba lagi nanti.')
}
}
handler.command = /^mediafire2|mf$/i
handler.help = ['mediafire2 <url>']
handler.tags = ['downloader','premium']
handler.limit = true
handler.premium = true
module.exports = handler;