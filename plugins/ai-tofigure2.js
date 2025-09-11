/*
* Nama fitur : To figure
* Type : Plugin CJS
* Author : Alfatsyah
*/

const { GoogleGenAI } = require('@google/genai')

// API KEY langsung ditaruh di sini
const APIKEY = global.geminimaker

const PROMPT = 'Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.'

let handler = async (m, { conn }) => {
  try {
    // ambil mime dari reply atau pesan utama
    let q = m.quoted ? m.quoted : m
    const mime = q.mimetype || ''
    if (!/image/.test(mime)) {
      return m.reply('Kirim atau reply gambar dengan command: .tofigure / .buatfigure')
    }

    // react dengan emoji random
    const emojis = ['🔥','✨','⚡','🎨','🖼','🧩','🎭','🤖']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    await conn.sendMessage(m.chat, { react: { text: randomEmoji, key: m.key }})

    const imageBuffer = await q.download()
    if (!imageBuffer) return m.reply('Eror pas mengunduh gambar')

    const ai = new GoogleGenAI({ apiKey: APIKEY })
    const base64Image = imageBuffer.toString('base64')

    const contents = [
      { text: PROMPT },
      {
        inlineData: {
          mimeType: mime,
          data: base64Image
        }
      }
    ]

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents
    })

    const parts = response?.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        await conn.sendFile(m.chat, buffer, 'figure.png', 'Nih hasil jadi figurenya 🗿', m)
      }
    }
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['tofigure2', 'buatfigure2']
handler.tags = ['ai', 'premium']
handler.command = /^(tofigure2|buatfigure2)$/i 
handler.premium = true

module.exports = handler
