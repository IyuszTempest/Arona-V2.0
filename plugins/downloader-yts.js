/*
- Plugins Youtube Search doang
- Source: https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
*/
const ytSearch = require('yt-search');

function formatNumber(num) {
  const suffixes = ['', 'k', 'M', 'B', 'T']
  const numString = Math.abs(num).toString()
  const numDigits = numString.length

  if (numDigits <= 3) {
    return numString
  }

  const suffixIndex = Math.floor((numDigits - 1) / 3)
  let formattedNum = (num / Math.pow(1000, suffixIndex)).toFixed(1)

  if (formattedNum.endsWith('.0')) {
    formattedNum = formattedNum.slice(0, -2)
  }

  return formattedNum + suffixes[suffixIndex]
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `EX:\n${usedPrefix + command} somebody pleasure`, m)

  try {
    const search = await ytSearch(text)
    const videos = search.videos.slice(0, 10)

    if (!videos.length) return conn.reply(m.chat, 'Tidak ditemukan hasil untuk pencarian tersebut.', m)

    const primary = videos[0]

    let caption = `Hasil Pencarian YouTube: "${text}"\n\n`
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      caption += `Judul   : ${v.title}\n`
      caption += `Durasi  : ${v.timestamp}\n`
      caption += `Views   : ${formatNumber(v.views)}\n`
      caption += `Upload  : ${v.ago}\n`
      caption += `Link    : ${v.url}\n`
      caption += `────────────────────────────\n`
    }

    await conn.sendMessage(m.chat, {
      text: caption.trim(),
      contextInfo: {
        externalAdReply: {
          title: primary.title,
          thumbnailUrl: primary.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: primary.url
        }
      }
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, 'Terjadi kesalahan saat mencari video.', m)
  }
}

handler.command = /^yts(earch)?$/i
handler.help = ['yts <query>']
handler.tags = ['internet','downloader']
handler.register = true;

module.exports = handler;