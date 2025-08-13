/* 
• Plugins Guardian Tales
• Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
• Source Scrape: https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z
*/

const fetch = require ( 'node-fetch')
const cheerio = require ('cheerio')

const BASE_URL = 'https://www.guardiantales.com'

async function getNewsList() {
  const res = await fetch(`${BASE_URL}/news/latest?type=all`)
  const html = await res.text()
  const $ = cheerio.load(html)
  const newsItems = []

  $('li').each((i, el) => {
    const anchor = $(el).find('a')
    const link = anchor.attr('href')
    const fullLink = link ? new URL(link, BASE_URL).href : null

    const textLines = $(el).text().split('\n').map(t => t.trim()).filter(t => t)

    let title = textLines.find(line => /^[A-Z\s]+$/.test(line)) || 'Tanpa Judul'
    let date = textLines.find(line => /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b.*\d{4}/i.test(line)) || null
    let summary = null
    if (date) {
      const index = textLines.indexOf(date)
      summary = textLines[index + 1] || null
    }

    if (title && fullLink) {
      newsItems.push({ title, date, summary, link: fullLink })
    }
  })

  return newsItems
}

async function getNewsDetail(url) {
  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)

  const category = $('.box_headpost em.info_category').first().contents().filter(function () {
    return this.type === 'text'
  }).text().trim()

  const date = $('.box_headpost .txt_date').first().text().trim()
  const title = $('.box_headpost strong.tit_headpost').first().text().trim()

  const content = $('.box_post .cms_article').first()
  content.find('script, style, noscript').remove()

  let articleText = content.text().replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim()
  articleText = articleText.replace(/■/g, '\n■').replace(/(Item Price)/gi, '\n$1\n')

  const paragraphs = articleText.split(/(?<=\.)\s+/)

  return {
    category,
    date,
    title,
    paragraphs,
    url
  }
}

let handler = async (m, { args, command }) => {
  if (command === 'gtnews') {
    const news = await getNewsList()
    if (!news.length) return m.reply('❌ Tidak ada berita ditemukan.')

    let teks = ''
    news.slice(0, 10).forEach((item, idx) => {
      teks += `\n${idx + 1}. Title: ${item.title}`
      if (item.date) teks += `\n${item.date}`
      if (item.summary) teks += `\n${item.summary}`
      teks += `\n${item.link}\n`
    })

    m.reply(teks.trim())
  }

  if (command === 'gtdetail') {
    const url = args[0]

    if (!url) {
      return m.reply(
        `Cara penggunaan:\n\n` +
        `Ketik *.gtdetail <url berita>*\n` +
        `Contoh:\n.gtdetail https://www.guardiantales.com/news/4676`
      )
    }

    if (!url.includes(BASE_URL)) {
      return m.reply('❌ URL tidak valid.\nPastikan berasal dari situs: https://www.guardiantales.com')
    }

    const detail = await getNewsDetail(url)
    if (!detail) return m.reply('❌ Gagal mengambil isi berita.')

    let teks = ''
    teks += `Kategori: ${detail.category}\n`
    teks += `Tanggal : ${detail.date}\n`
    teks += `Judul   : ${detail.title}\n\n`
    detail.paragraphs.forEach(p => {
      teks += `${p}\n\n`
    })
    teks += `URL: ${detail.url}`

    m.reply(teks.trim())
  }
}

handler.command = ['gtnews', 'gtdetail']
handler.tags = ['internet']
handler.help = ['gtnews', 'gtdetail <url>']
handler.limit = 2

module.exports = handler;