/*
`DOUYIN`
weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W

weem scrape :
https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L
*/

const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `Contoh penggunaan:\n${usedPrefix + command} https://v.douyin.com/iPX4EBFY/`

  let url = args[0]
  try {
    let results = await douyin(url)
    if (!results.length) throw 'Tidak ada video yang ditemukan.'

    for (let result of results) {
      let hd = result.downloadLinks.find(x => /hd/i.test(x.title))
      let mp4_2 = result.downloadLinks.find(x => /mp4 2/i.test(x.title))
      let mp4_1 = result.downloadLinks.find(x => /mp4 1/i.test(x.title))
      let mp3 = result.downloadLinks.find(x => /mp3/i.test(x.title))

      if (hd) {
        await conn.sendMessage(m.chat, {
          video: { url: hd.url }
        }, { quoted: m })
      } else if (mp4_2) {
        await conn.sendMessage(m.chat, {
          video: { url: mp4_2.url }
        }, { quoted: m })
      } else if (mp4_1) {
        await conn.sendMessage(m.chat, {
          video: { url: mp4_1.url }
        }, { quoted: m })
      }

      if (mp3) {
        await conn.sendMessage(m.chat, {
          audio: { url: mp3.url },
          mimetype: 'audio/mpeg'
        }, { quoted: m })
      }
    }
  } catch (e) {
    console.error(e)
    throw 'Terjadi kesalahan saat mengambil data dari Douyin.'
  }
}

handler.help = ['douyin <url>']
handler.tags = ['downloader']
handler.command = /^douyin$/i
handler.register = true
handler.limit = true

module.exports = handler

async function douyin(url) {
  const postData = qs.stringify({
    q: url, 
    lang: 'id',
    cftoken: ''
  })

  const response = await axios.post(
    'https://tikvideo.app/api/ajaxSearch',
    postData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  )

  if (response.data.status === 'ok') {
    const html = response.data.data
    const $ = cheerio.load(html)
    const results = []

    $('.tik-video').each((i, elem) => {
      const title = $(elem).find('.thumbnail .content h3').text().trim()
      const duration = $(elem).find('.thumbnail .content p').first().text().trim()
      const thumbnail = $(elem).find('.thumbnail img').attr('src')

      const downloadLinks = []
      $(elem).find('.dl-action a').each((j, link) => {
        downloadLinks.push({
          title: $(link).text().trim(),
          url: $(link).attr('href')
        })
      })

      results.push({ title, duration, thumbnail, downloadLinks })
    })

    return results
  } else {
    throw new Error(`Gagal mendapatkan data dari Douyin: ${response.data}`)
  }
}