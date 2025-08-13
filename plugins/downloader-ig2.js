/* Plugins CJS
Instagram downloader
Sumber :https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
Author : F6F411
*/
const fetch = require('node-fetch')

const snapins = async (urlIgPost) => {
    const headers = {
        "content-type": "application/x-www-form-urlencoded"
    }

    const response = await fetch("https://snapins.ai/action.php", {
        headers,
        body: "url=" + encodeURIComponent(urlIgPost),
        method: "POST"
    })

    if (!response.ok) throw Error(`Gagal mendownload informasi. ${response.status} ${response.statusText}`)

    const json = await response.json()

    const name = json.data?.[0]?.author?.name || "(no name)"
    const username = json.data?.[0]?.author?.username || "(no username)"

    let images = []
    let videos = []

    json.data?.forEach(v => {
        if (v.type === "image") {
            images.push(v.imageUrl)
        } else if (v.type === "video") {
            videos.push(v.videoUrl)
        }
    })

    return { name, username, images, videos }
}

let handler = async (m, { conn, args, command }) => {
    if (!args[0]) throw `Mana URL Instagram nya?\nContoh : .${command} https://www.instagram.com/p/xxxxx/`

    // emoji proses random
    const emojis = ['⏳', '🔄', '📡', '📥', '🔍', '🌀', '📲']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
    m.reply(`${randomEmoji} Sedang memproses, tunggu sebentar...`)

    let { images, videos } = await snapins(args[0])

    if (images.length > 0) {
        await m.reply(`📷 Terdeteksi ${images.length} foto, akan dikirim...`)
        for (const img of images) {
            await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m })
        }
    }

    if (videos.length > 0) {
        await m.reply(`🎥 Terdeteksi ${videos.length} video, akan dikirim...`)
        for (const vid of videos) {
            await conn.sendMessage(m.chat, { video: { url: vid } }, { quoted: m })
        }
    }
}

handler.command = ['ig2', 'igdl2', 'instagram2']
handler.help = ['ig2']
handler.tags = ['downloader']

module.exports = handler