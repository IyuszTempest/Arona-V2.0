/*
PLUGINS CJS 
• Hd Image Upscaler
• Sumber Scraper: https://whatsapp.com/channel/0029Vb2mOzL1Hsq0lIEHoR0N/579
• Ver. Esm By Zenzz: https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639/1012
• Ver. CJS By IyuszTempest: https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

const availableScaleRatio = [2, 4]

const imgupscale = {
  req: async (imagePath, scaleRatio) => {
    const form = new FormData()
    form.append('myfile', fs.createReadStream(imagePath))
    form.append('scaleRadio', scaleRatio.toString())

    const response = await axios.request({
      method: 'POST',
      url: 'https://get1.imglarger.com/api/UpscalerNew/UploadNew',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'origin': 'https://imgupscaler.com',
        'referer': 'https://imgupscaler.com/',
        ...form.getHeaders()
      },
      data: form
    })

    return response.data
  },

  cek: async (code, scaleRatio) => {
    const response = await axios.request({
      method: 'POST',
      url: 'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'origin': 'https://imgupscaler.com',
        'referer': 'https://imgupscaler.com/'
      },
      data: JSON.stringify({ code, scaleRadio: scaleRatio })
    })

    return response.data
  },

  upscale: async (imagePath, scaleRatio, maxRetries = 30, retryDelay = 2000) => {
    const uploadResult = await imgupscale.req(imagePath, scaleRatio)
    if (uploadResult.code !== 200) {
      throw new Error(`Upload failed : ${uploadResult.msg}`)
    }

    const { code } = uploadResult.data
    for (let i = 0; i < maxRetries; i++) {
      const statusResult = await imgupscale.cek(code, scaleRatio)

      if (statusResult.code === 200 && statusResult.data.status === 'success') {
        return {
          success: true,
          downloadUrls: statusResult.data.downloadUrls
        }
      }

      if (statusResult.data.status === 'error') {
        throw new Error('Processing failed on server')
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    throw new Error('Processing timeout - maximum retries exceeded')
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // Definisi fkontak
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

  if (!m.quoted || !/image/.test(m.quoted.mimetype || '')) {
    return conn.reply(m.chat, `Balas gambar dengan caption *${usedPrefix + command}* 2x atau *${usedPrefix + command}* 4x`, fkontak)
  }

  const scale = args[0]?.replace(/x/i, '') || '2'
  if (!availableScaleRatio.includes(Number(scale))) {
    return conn.reply(m.chat, 'Pilih resolusi: 2x atau 4x', fkontak)
  }

  try {
    await conn.reply(m.chat, global.wait, fkontak)
    const buffer = await m.quoted.download()
    const tmpPath = path.join(process.cwd(), `zenn?_${Date.now()}.jpg`)
    fs.writeFileSync(tmpPath, buffer)

    const result = await imgupscale.upscale(tmpPath, Number(scale))
    fs.unlinkSync(tmpPath)

    if (!result.success || !result.downloadUrls?.length) {
      throw new Error('Gagal upscale')
    }

    await conn.sendFile(m.chat, result.downloadUrls[0], 'jenzxz.png', '✅ Berhasil meningkatkan kualitas gambar', fkontak)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    const errorMessage = typeof err === 'string' ? err : '❌ Gagal membuat gambar upscale. Pastikan API berfungsi dengan baik.';
    conn.reply(m.chat, errorMessage, fkontak)
  }
}

handler.help = ['hd']
handler.tags = ['ai', 'tools']
handler.command = ['hd']

module.exports = handler
          
