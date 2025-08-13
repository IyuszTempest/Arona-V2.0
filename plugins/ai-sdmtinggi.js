const{ GoogleGenAI, Modality } = require ('@google/genai')
let handler = async (m, { conn }) => {
try {
const q = m.quoted ? m.quoted : m
const mime = (q.msg || q).mimetype || ''
if (!mime.startsWith('image/')) return m.reply('Kirim Gambarnya \n\nNote : Gamabr Wajib 1 Objek Kalau Mau Akurat Sedikit')
m.reply('Wait...')
let buffer = await q.download()
let base64 = buffer.toString('base64')
const ai = new GoogleGenAI({
apiKey: global.geminimaker
})
const contents = [
{ text: 'Edit the uploaded image by keeping the exact same character and anything they are holding without changing their pose, position, or appearance, convert only the character and held objects into grayscale with all visual details preserved (not fully white), add a clean solid black rectangular censor bar that precisely follows the orientation of the character’s eyes and covers only the eyes, remove the entire original background completely and replace it with a flat solid pure red color (#FF0000), and make sure no parts of the character or the items they are holding are removed or replaced.' },
{
inlineData: {
mimeType: mime,
data: base64
}
}
]
let res = await ai.models.generateContent({
model: 'gemini-2.0-flash-preview-image-generation',
contents,
config: {
responseModalities: [Modality.TEXT, Modality.IMAGE]
}
})
for (let part of res.candidates?.[0]?.content?.parts || []) {
if (part.text) await m.reply(part.text)
if (part.inlineData) {
let buffer = Buffer.from(part.inlineData.data, 'base64')
await conn.sendMessage(m.chat, { image: buffer, caption: '*Done Ber Sdm Tinggi*' }, { quoted: m })
}
}
} catch (e) {
m.reply(e.message)
}
}
handler.help = ['sdm','sdmtinggi']
handler.command = ['sdm','sdmtinggi']
handler.tags = ['ai']
module.exports = handler;