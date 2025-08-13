/* plugins  play audio
  type cjs
   code prompt ai by ZIA ULHAQ  
   *SUMBER*
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X 
*/
   


const axios = require('axios')

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Masukkan judul lagu!\n\nContoh: .${command} bergek`)

  const quotedStatus = {
    key: {
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'ZIA-STATUS',
      participant: '0@s.whatsapp.net'
    },
    message: {
      conversation: 'kontak'
    }
  }

  await conn.sendMessage(m.chat, {
    text: 'wait..',
    contextInfo: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    }
  }, { quoted: quotedStatus })

  try {
    const api = `https://api.privatezia.biz.id/api/downloader/ytplaymp3?query=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data.status || !data.result?.downloadUrl) throw 'Gagal mengambil audio.'

    const { title, duration, thumbnail, downloadUrl, quality, videoUrl } = data.result

    const caption = `🎵 *Lagu Ditemukan!*\n\n` +
                    `📌 *Judul:* ${title}\n` +
                    `⏳ *Durasi:* ${duration} detik\n` +
                    `🎶 *Kualitas:* ${quality}\n` +
                    `🔗 *Link:* ${videoUrl}\n\n` +
                    `> 🎧 ᴡᴀɪᴛ ᴘʀᴏsᴇs sᴇᴅᴀɴɢ ᴅɪᴋɪʀɪᴍ...`

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Klik untuk menonton di YouTube',
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: quotedStatus })

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: quotedStatus })

    await conn.sendMessage(m.chat, {
      document: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: 'versi dokumen biar waktu kamu simpan ada judul'
    }, { quoted: quotedStatus })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: '❌ gagal'
    })
    m.reply('Terjadi kesalahan saat mengambil audio.')
  }
}

handler.help = ['ytplay <judul>']
handler.tags = ['downloader']
handler.command = /^ytplay$/i
handler.register = true;
handler.limit = 5;

module.exports = handler