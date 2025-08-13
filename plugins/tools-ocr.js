/*
📌 Nama Fitur: Ocr [ optical character recognition ]
🏷️ Type : CJS
🔗 Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
✍️ Convert By ZenzXD
*/
const axios = require('axios')
const FormData = require('form-data')
async function Uguu(buffer, filename) {
const form = new FormData()
form.append('files[]', buffer, { filename })
const { data } = await axios.post('https://uguu.se/upload.php', form, {
headers: form.getHeaders(),
})
if (data.files && data.files[0]) {
return data.files[0].url
} else {
throw new Error('aplot ke uguu.se gagal coba lagi nanti')
}
}
const handler = async (m, { conn }) => {
try {
await conn.sendMessage(m.chat, {
react: {
text: '🕒',
key: m.key
}
})
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime || !mime.startsWith('image/'))
throw 'silakan kirim atau reply gambar'
let media = await q.download()
let ext = mime.split('/')[1] || 'jpg'
let filename = `ocr.${ext}`
let imageUrl = await Uguu(media, filename)
let { data } = await axios.get(`https://zenz.biz.id/tools/ocr?url=${encodeURIComponent(imageUrl)}`)
if (!data?.status || !data.result?.text) throw 'ocr gagal wok, atau text ga di temukan'
let hasil = data.result.text.replace(/\r/g, '').trim()
await conn.sendMessage(m.chat, {
react: {
text: '✅',
key: m.key
}
})
m.reply(hasil)
} catch (err) {
m.reply(typeof err === 'string' ? err : err.message || 'eror, terjadi kesalahan saat memproses gambar')
}
}
handler.command = ['ocr']
handler.tags = ['tools']
handler.help = ['ocr']
module.exports = handler