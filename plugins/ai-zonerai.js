const axios = require('axios')
const FormData = require('form-data')
const https = require('https')

const reso = {
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
  square: { width: 1024, height: 1024 },
  ultra: { width: 1536, height: 1536 },
  tall: { width: 832, height: 1344 },
  wide: { width: 1344, height: 832 },
}

async function Txt2IMG(prompt, resolusi, upscale = 2) {
  const selected = reso[resolusi]||reso.portrait
  const { width, height } = selected

  const promises = Array.from({ length: 3 }, (_, idx) => {
    const form = new FormData()
    form.append('Prompt', prompt)
    form.append('Language', 'eng_Latn')
    form.append('Size', `${width}x${height}`)
    form.append('Upscale', upscale.toString())
    form.append('Batch_Index', idx.toString())

    const agent = new https.Agent({ rejectUnauthorized: false })

    return axios.post(
      'https://api.zonerai.com/zoner-ai/txt2img',
      form,
      {
        httpsAgent: agent,
        headers: {
          ...form.getHeaders(),
          'Origin': 'https://zonerai.com',
          'Referer': 'https://zonerai.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
        },
        responseType: 'arraybuffer'
      }
    ).then(res => {
      const buffer = Buffer.from(res.data)
      return buffer
    })
  })

  return Promise.all(promises)
}

let yeon = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })
    return conn.sendMessage(m.chat, {
      text: `✨ *ZONER AI* ✨

> 📌 *Penggunaan:* ${usedPrefix + command} prompt|resolusi
> 📌 *Contoh Perintah:* ${usedPrefix + command} futuristic anime girl|square

🔎 *Resolusi Tersedia*
- - Portrait
- ⁠- Landscape
- ⁠- Square
- ⁠- Ultra
- ⁠- Tall
- ⁠- Wide`
    })
  }

  const [prompt, resolution] = text.split('|').map(item => item.trim())
  const validRes = ['portrait', 'landscape', 'square', 'ultra', 'tall', 'wide']
  const resChoice = resolution && validRes.includes(resolution.toLowerCase()) 
    ? resolution.toLowerCase() 
    : 'portrait'

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    const images = await Txt2IMG(prompt, resChoice)
    
    for (const [index, buffer] of images.entries()) {
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: index === 0 ? `✨ *ZonerAI - ${resChoice.toUpperCase()}*\n🖋️ *Prompt:* ${prompt}\n📐 *Resolusi:* ${reso[resChoice].width}x${reso[resChoice].height}\n🖼️ *Gambar ${index + 1}/3*` : ''
      })
    }

    await conn.sendMessage(m.chat, {
      react: { text: "✨", key: m.key }
    })

  } catch (e) {
    await conn.sendMessage(m.chat, {
      react: { text: "⛔️", key: m.key }
    })
    await conn.sendMessage(m.chat, {
      text: `😞 *Yahh error, Senpai!*\nFitur AI lagi lelah nih.. Coba lagi nanti ya?\n\n💡 *Error:* ${e.message}`
    })
  }
}

yeon.help = ['zonerai <prompt>|<resolusi>']
yeon.tags = ['ai']
yeon.command = /^(zonerai)$/i
yeon.register = true
yeon.limit = true
module.exports = yeon