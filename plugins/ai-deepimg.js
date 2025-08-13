/*
*[ Plugin Create Image(DeepImage) ]*
*[ Sumber ]*
https://whatsapp.com/channel/0029Vafs40K4dTnIXMqfQa2Q
*[ Created by ]*
OwnBlox
*/

const axios = require('axios');

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply(`*「 DEEP IMAGE GENERATOR 」*

Cara penggunaan:
.deepimg <prompt> | <style>

Contoh penggunaan:
.deepimg City at night | Cyberpunk
.deepimg Beautiful fantasy forest | Fantasy

Jika <style> tidak diisi, otomatis akan menggunakan style *realistic*

Contoh tanpa style:
.deepimg Sunset over the mountains
`)

  let [prompt, style] = text.split('|').map(a => a.trim())
  if (!prompt) return m.reply('Masukkan prompt-nya! Contoh: .deepimg City | Cyberpunk')

  style = (style || 'realistic').toLowerCase()

  m.reply('⏳ Sedang membuat gambar...')

  const deviceId = `dev-${Math.floor(Math.random() * 1000000)}`
  try {
    const response = await axios.post('https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev', {
      prompt: `${prompt} -style ${style}`,
      size: "1024x1024",
      device_id: deviceId
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://deepimg.ai',
        'Referer': 'https://deepimg.ai/',
      }
    })

    const data = response.data
    if (data?.data?.images?.length > 0) {
      const imageUrl = data.data.images[0].url
      await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: `✅ Gambar berhasil dibuat!\n\n*Prompt:* ${prompt}\n*Style:* ${style}` }, { quoted: m })
    } else {
      m.reply('❌ Gagal mendapatkan gambar.')
    }
  } catch (err) {
    console.error(err.response ? err.response.data : err.message)
    m.reply('❌ Terjadi kesalahan saat membuat gambar.')
  }
}

handler.command = /^deepimg$/i
handler.tags = ['ai','premium']
handler.help = ['deepimg <prompt> | <style>']
handler.limit = 3
handler.premium = true;

module.exports = handler