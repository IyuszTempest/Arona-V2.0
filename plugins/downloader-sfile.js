/*
`SFILE SEARCH & DOWNLOAD`
Scrape by : +62 877-...-6619 (Agus Royal Roundtable)
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/

const cheerio = require('cheerio')
const fetch = require('node-fetch')

let handler = async (m, { text, args, conn }) => {
    if (/https:\/\/sfile\.mobi\//gi.test(text)) {
        try {
            let res = await download(text)
            if (!res) return m.reply('Download gagal.')

            const buff = Buffer.from(await (await fetch(res.download)).arrayBuffer())
            await conn.sendMessage(m.chat, {
                document: buff,
                fileName: res.filename,
                mimetype: res.mimetype,
                caption: `📁 *File Information* 📁
🔹 *Filename:* ${res.filename}
🔹 *Mimetype:* ${res.mimetype}
🔹 *Uploader:* ${res.uploader || 'N/A'}
🔹 *Upload Date:* ${res.up_at || 'N/A'}
🔹 *Downloads:* ${res.total_down || 'N/A'}
🔹 *Download URL:* ${res.download}`
            }, { quoted: m })
        } catch (e) {
            console.error(e)
            m.reply('Terjadi kesalahan saat mengunduh file.')
        }
    } else if (text) {
        try {
            let [query, page] = text.split('|')
            let res = await search(query.trim(), page ? parseInt(page) : 1)
            if (!res.length) return m.reply(`🔍 Tidak ditemukan hasil untuk "${query.trim()}"`)

            let caption = res.map((v, i) => {
                return `📌 *Result ${i + 1}*
🔖 *Title:* ${v.title || 'N/A'}
📦 *Size:* ${v.size || 'N/A'}
🔗 *Link:* ${v.link || 'N/A'}`
            }).join('\n\n━━━━━━━━━━━━━━━\n\n')

            m.reply(`🔎 *Hasil Pencarian untuk "${query.trim()}"*\n\n${caption}\n\n📝 Halaman: ${page || 1}`)
        } catch (e) {
            console.error(e)
            m.reply('Terjadi kesalahan saat mencari file.')
        }
    } else {
        m.reply(`Format salah!

Contoh:
• .sfile https://sfile.mobi/xxx
• .sfile naruto|2`)
    }
}

handler.help = ['sfile'].map(v => v + ' <query>|<halaman> atau <link>')
handler.tags = ['downloader']
handler.command = /^sfile$/i

module.exports = handler

// SCRAPER --------------------------------------

async function search(query, page = 1) {
    let res = await fetch(`https://sfile.mobi/search.php?q=${query}&page=${page}`)
    let $ = cheerio.load(await res.text())
    let result = []

    $('div.list').each(function () {
        let title = $(this).find('a').text()
        let size = $(this).text().trim().split('(')[1]
        let link = $(this).find('a').attr('href')
        if (link) result.push({ title, size: size.replace(')', ''), link })
    })

    return result
}

async function download(url) {
    let res = await fetch(url)
    let $ = cheerio.load(await res.text())

    let filename = $('img.intro').attr('alt')
    let mimetype = $('div.list').text().split(' - ')[1].split('\n')[0]
    let dl = $('#download').attr('href')
    let up_at = $('.list').eq(2).text().split(':')[1].trim()
    let uploader = $('.list').eq(1).find('a').eq(0).text().trim()
    let total_down = $('.list').eq(3).text().split(':')[1].trim()

    let data = await fetch(dl)
    let $$ = cheerio.load(await data.text())
    let anu = $$('script').text()
    let download = anu.split('sf = "')[1].split('"')[0].replace(/\\/g, '')

    return { filename, mimetype, up_at, uploader, total_down, download }
}