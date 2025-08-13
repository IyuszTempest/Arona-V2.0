const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const handler = async (m, { conn }) => {
try {
let q = m.quoted || m
let mime = (q.msg || q).mimetype || ''
if (!mime.startsWith('image')) return m.reply('Mana Gambar Nya?')
let tmp = './tmp'
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
let file = path.join(tmp, `${Date.now()}.jpg`)
let buffer = await q.download()
fs.writeFileSync(file, buffer)
let form = new FormData()
form.append('image', fs.createReadStream(file))
let { data } = await axios.post('https://www.abella.icu/removal-bg', form, { headers: form.getHeaders() })
let url = data?.data?.previewUrl
if (url) {
await conn.sendMessage(m.chat, { image: { url } }, { quoted: m })
} else {
m.reply('Error')
}
fs.unlinkSync(file)
} catch (e) {
m.reply(e.message)
}
}
handler.help = ['removebg']
handler.command = ['removebg']
handler.tags = ['tools']
module.exports = handler