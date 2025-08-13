/* 
• Plugins Pinterest Downloader
• Info: Support Image & Video
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029VbAMa9d6rsQy9Y1XGO0l/102
*/

const axios = require ('axios')

const handler = async (m, { conn, text, command }) => {
  if (!text) return conn.sendMessage(m.chat, {
    text: `Mana linknya, dasar sensei bodoh!\n\nContoh:\n.${command} https://id.pinterest.com/pin/16044142417873989/`
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    react: { text: '✨', key: m.key }
  })

  try {
    const res = await pinterestDL(text)
    if (!res.success || !res.media.length) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })
      return conn.sendMessage(m.chat, {
        text: '😡 Gagal dapetin gambar! Mungkin link-nya ngaco, coba lagi sensei!'
      }, { quoted: m })
    }

    const best = res.media[0]
    if (!best.url) throw new Error('Nani?! Gambar ngilang!?')

    const type = best.extension === 'jpg' ? 'image' : 'video'

    await conn.sendMessage(m.chat, {
      [type]: { url: best.url },
      caption: `✨ Nih, udah tak ambilin yang paling HD, puas kan~!\n\n🎞️ *Tipe:* ${best.extension.toUpperCase()}\n📁 *Kualitas:* ${best.quality || 'default'}\n📦 *Ukuran:* ${best.size ? (best.size / 1024).toFixed(2) + ' KB' : 'Nggak tau 🥲'}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
    await conn.sendMessage(m.chat, {
      text: '😤 Gomen! Tapi errornya ngeselin banget. Coba lagi nanti ya~'
    }, { quoted: m })
  }
}

handler.help = ['pindl <url>']
handler.tags = ['downloader']
handler.command = /^pindl$/i

module.exports = handler;

async function pinterestDL(url) {
  try {
    if (!url) throw new Error('Kamu kira ini sulap? URL-nya mana woi.')

    const res = await axios.get(`https://pinterestdownloader.io/frontendService/DownloaderService?url=${url}`, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': 'https://pinterestdownloader.io',
        'Referer': 'https://pinterestdownloader.io/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    })

    const data = res.data
    if (!data?.medias) throw new Error('Hah? Kagak nemu medianya, zannen desu ne...')

    const originalsSet = new Set()
    const mediaList = []

    for (const media of data.medias) {
      mediaList.push(media)

      if (media.extension === 'jpg' && media.url.includes('i.pinimg.com/')) {
        const originalUrl = media.url.replace(/\/\d+x\//, '/originals/')
        if (!originalsSet.has(originalUrl)) {
          originalsSet.add(originalUrl)
          mediaList.push({ ...media, url: originalUrl, quality: 'original' })
        }
      }
    }

    const sorted = mediaList.sort((a, b) => (b.size || 0) - (a.size || 0))

    return {
      success: true,
      media: sorted
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}