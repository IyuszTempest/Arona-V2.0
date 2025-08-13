const axios = require('axios')
const FormData = require('form-data')
async function uploadMedia(buffer, filename) {
const form = new FormData()
form.append('file', buffer, filename)
const { data } = await axios.post('https://cdn.vioo.my.id/upload', form, {
headers: {
...form.getHeaders(),
'Accept': 'application/json'
}
})
return data
}
let handler = async (m, { conn }) => {
try {
let q = m.quoted || m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw 'Mana Media Yang mau Di Upload?.'
m.reply('Wait...')
const buffer = await q.download()
if (buffer.length > 50 * 1024 * 1024) throw 'Max Size 50MB'
const ext = mime.split(';')[0].split('/')[1]
const filename = `Anu_${Date.now()}.${ext}`
const result = await uploadMedia(buffer, filename)
m.reply(`${result.data.url}`)
} catch (e) {
m.reply(typeof e === 'string' ? e : e.message)
}
}
handler.help = ['vioup']
handler.command = ['vioup']
handler.tags = ['tools']
module.exports = handler