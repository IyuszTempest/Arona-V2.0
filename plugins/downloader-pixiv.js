/*
Plugin: Pixiv Downloader (CJS)
Author : F6F411
Sumber CJS :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
GET API: lolhuman.xyz
*/

const fetch = require('node-fetch')

// ====== API KEY ======
const LOLHUMAN_KEY = global.lolkey;

// ====== Emoji Random ======
function randomEmoji() {
  const list = ['🎨', '✨', '🔥', '💫', '🌸', '🌟', '🎶', '💎', '🖼️', '💖']
  return list[Math.floor(Math.random() * list.length)]
}

// ====== Extract ID dari URL atau angka ======
function extractPixivId(input = '') {
  const m = String(input).match(/(\d{6,})(?!.*\d)/)
  return m ? m[1] : null
}

// ====== Normalisasi response API ke array gambar ======
function normalizeImageUrls(apiJson) {
  if (!apiJson) return []
  const r = apiJson.result || apiJson.results || apiJson

  if (Array.isArray(r) && r.every(x => typeof x === 'string')) return r

  if (Array.isArray(r) && r.length) {
    const urls = []
    for (const it of r) {
      if (!it) continue
      if (typeof it === 'string') {
        urls.push(it)
        continue
      }
      if (it.url) urls.push(it.url)
      else if (it.image) urls.push(it.image)
      else if (it.urls) {
        if (typeof it.urls === 'string') urls.push(it.urls)
        else if (Array.isArray(it.urls)) urls.push(...it.urls)
        else if (typeof it.urls.original === 'string') urls.push(it.urls.original)
      }
    }
    if (urls.length) return urls
  }

  if (r && typeof r === 'object') {
    if (Array.isArray(r.images)) return r.images
    if (Array.isArray(r.urls)) return r.urls
    if (typeof r.image === 'string') return [r.image]
    if (r.urls && typeof r.urls.original === 'string') return [r.urls.original]
  }
  return []
}

// ====== Bangun Caption ======
function buildCaption(json, id) {
  const r = json && (json.result || json.results || json)
  const title = r && (r.title || r.illust_title || r.name)
  const author = r && (r.author || r.user?.name || r.user)
  let tags = r && (r.tags || r.tag)
  if (Array.isArray(tags)) tags = tags.map(t => (typeof t === 'string' ? t : t?.name)).filter(Boolean).join(', ')
  if (typeof tags !== 'string') tags = undefined

  const emoji = randomEmoji()
  let cap = `${emoji} *Pixiv Download*\n\n🆔 ID: ${id}`
  if (title) cap += `\n📌 Title: ${title}`
  if (author) cap += `\n✍️ Author: ${author}`
  if (tags) cap += `\n🏷️ Tags: ${tags}`
  cap += `\n🔗 Source: https://www.pixiv.net/en/artworks/${id}\n${emoji}`

  return cap
}

// ====== Handler ======
let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(
      `Contoh pemakaian:\n${usedPrefix + command} 63456028\n${usedPrefix + command} https://www.pixiv.net/en/artworks/63456028`
    )

    const id = extractPixivId(text)
    if (!id) return m.reply('⚠️ Gagal membaca ID Pixiv.\nKirimkan *illust_id* atau *URL Pixiv* yang valid.')

    const url = `https://lolhuman.xyz/api/pixivdl/${id}?apikey=${LOLHUMAN_KEY}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const json = await res.json().catch(() => ({}))

    if (json.status && json.status !== 200 && json.status !== true) {
      const msg = json.message || json.msg || 'Tidak ada pesan kesalahan.'
      throw new Error(`API mengembalikan status ${json.status}: ${msg}`)
    }

    const images = normalizeImageUrls(json)
    if (!images.length) {
      if (typeof (json.result || json) === 'string') images.push(json.result || json)
    }
    if (!images.length) throw new Error('Tidak menemukan URL gambar dari API.')

    const caption = buildCaption(json, id)
    let sent = 0
    for (let i = 0; i < images.length; i++) {
      const fileUrl = images[i]
      const fname = `pixiv_${id}_${i + 1}.jpg`
      await conn.sendFile(m.chat, fileUrl, fname, i === 0 ? caption : null, m)
      sent++
    }

    if (!sent) throw new Error('Pengiriman gagal tanpa alasan yang jelas.')

  } catch (err) {
    console.error('pixivdl error:', err)
    m.reply(`❌ Gagal mengunduh Pixiv.\n• Alasan: ${err.message || err}\n• Coba lagi dengan ID lain atau pastikan API key benar.`)
  }
}

handler.help = ['pixivdl <id/url>', 'pxdl <id/url>']
handler.tags = ['downloader']
handler.command = /^(pixivdl)$/i
handler.limit = true

module.exports = handler
