/* - Plugins Youtube Search Euphylia Edition
- Library: yt-search
*/
const ytSearch = require('yt-search');

// List emoji random ala Jepang
const searchEmojis = ['🔍', '📡', '🌀', '🍱', '🍥', '🎋', '⛩️', '🏮', '🎐', '💠'];

function formatNumber(num) {
  const suffixes = ['', 'k', 'M', 'B', 'T']
  const numString = Math.abs(num).toString()
  const numDigits = numString.length

  if (numDigits <= 3) return numString
  const suffixIndex = Math.floor((numDigits - 1) / 3)
  let formattedNum = (num / Math.pow(1000, suffixIndex)).toFixed(1)
  if (formattedNum.endsWith('.0')) formattedNum = formattedNum.slice(0, -2)
  return formattedNum + suffixes[suffixIndex]
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*– Contoh:* ${usedPrefix + command} Ray of Light Hanatan`)

  // 1. FAST REACT (Biaya tampil keren pertama kali)
  let randomEmoji = searchEmojis[Math.floor(Math.random() * searchEmojis.length)];
  await conn.sendMessage(m.chat, { react: { text: randomEmoji, key: m.key } }).catch(() => {})

  try {
    const search = await ytSearch(text)
    const videos = search.videos.slice(0, 10)

    if (!videos.length) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return m.reply('Gomen, hasil tidak ditemukan.')
    }

    const primary = videos[0]

    // --- Dashboard Hasil Pencarian ---
    let caption = `╭━━〔 ⛩️ *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝚂𝙴𝙰𝚁𝙲𝙷* ⛩️ 〕━━┓\n`
    caption += `┃ 🔍 *𝚀𝚞𝚎𝚛𝚢:* ${text}\n`
    caption += `┃ 💠 *𝚁𝚎𝚜𝚞𝚕𝚝𝚜:* 10 found\n`
    caption += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`

    for (let i = 0; i < videos.length; i++) {
      const v = videos[i]
      caption += `${i + 1}. 🍙 *${v.title}*\n`
      caption += `   ◦ 🕒 *𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗:* ${v.timestamp}\n`
      caption += `   ◦ 👁️ *𝚅𝚒𝚎𝚠𝚜:* ${formatNumber(v.views)}\n`
      caption += `   ◦ 📅 *𝚄𝚙𝚕𝚘𝚊𝚍:* ${v.ago}\n`
      caption += `   ◦ 🔗 *𝚄𝚛𝚕:* ${v.url}\n\n` // Ditambah \n ganda biar rapi
    }

    caption += `_Total Results: ${videos.length}_\n${global.wm}`

    await conn.sendMessage(m.chat, {
      image: { url: primary.thumbnail },
      caption: caption.trim(),
      contextInfo: {
        externalAdReply: {
          title: primary.title,
          body: `Channel: ${primary.author.name}`,
          thumbnailUrl: primary.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: primary.url
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('Terjadi kesalahan saat mencari video.')
  }
}

handler.help = ['yts', 'ytsearch']
handler.tags = ['internet']
handler.command = /^yts(earch)?$/i

module.exports = handler
