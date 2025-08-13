const axios = require("axios")
let handler = async (m, { conn, args }) => {
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime) throw 'Reply/send image with caption *.img2prompt*'
if (!/image\/(jpe?g|png)/.test(mime)) throw 'Only JPEG/PNG images are supported'
let imgBuffer = await q.download()
let base64Img = imgBuffer.toString('base64')
let base64Url = `data:${mime};base64,${base64Img}`
let { data } = await axios.post('https://imageprompt.org/api/ai/prompts/image',
{ base64Url },
{ headers: { 'accept': '/', 'content-type': 'application/json' } }
)
let prompt = data?.prompt || data
if (!prompt) throw 'No prompt generated'
await m.reply(`${prompt}`)
} catch (e) {
m.reply(e.message)
}
}
handler.help = ['imgprompt']
handler.command = ['imgprompt']
handler.tags = ['tools','ai']
module.exports = handler