const axios = require('axios')
const fs = require('fs')
const path = require('path')
async function ghibliArt(prompt) {
try {
const { data } = await axios.post('https://ghibliart.net/api/generate-image', { prompt }, {
headers: {
'accept': '*/*',
'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
'content-type': 'application/json',
'origin': 'https://ghibliart.net',
'referer': 'https://ghibliart.net/',
'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
'cookie': '_ga_DC0LTNHRKH=GS2.1.s1748942966$o1$g0$t1748942966$j60$l0$h0; _ga=GA1.1.1854864196.1748942966',
'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
'sec-ch-ua-mobile': '?0',
'sec-ch-ua-platform': '"Windows"',
'sec-fetch-dest': 'empty',
'sec-fetch-mode': 'cors',
'sec-fetch-site': 'same-origin',
'priority': 'u=1, i'
}
})
const img = data?.image || data?.url
const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
const filename = `${prompt.replace(/\s+/g, '_')}-${Date.now()}.jpg`
const filepath = path.join(tmp, filename)
if (img.startsWith('data:image/') || img.startsWith('iVBORw')) {
const base64 = img.replace(/^data:image\/\w+;base64,/, '')
fs.writeFileSync(filepath, Buffer.from(base64, 'base64'))
} else {
const { data: buffer } = await axios.get(img, { responseType: 'arraybuffer' })
fs.writeFileSync(filepath, buffer)
}
return filepath
} catch (error) {
throw new Error(`${error.message}`)
}
}
const handler = async (m, { conn, args }) => {
try {
if (!args[0]) return m.reply('Masukkan prompt untuk generate gambar\n\nExample : .ghibliart cat in anime style')
const prompt = args.join(' ')
m.reply('Wait...')
const filePath = await ghibliArt(prompt)
await conn.sendMessage(m.chat, {
image: fs.readFileSync(filePath)
}, { quoted: m })
fs.unlinkSync(filePath)
} catch (e) {
m.reply(e.message)
}
}
handler.help = ['ghibli']
handler.command = ['ghibli']
handler.tags = ['ai','anime','premium']
handler.premium = true;
module.exports = handler