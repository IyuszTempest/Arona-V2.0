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
    if (!args[0]) {
        return conn.reply(m.chat, `Mana URL Instagram nya, Sensei?\nContoh : .${command} https://www.instagram.com/p/xxxxx/`, m);
    }

    try {
        // emoji proses random
        const emojis = ['⏳', '🔄', '📡', '📥', '🔍', '🌀', '📲'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await conn.reply(m.chat, `${randomEmoji} Sedang memproses, tunggu sebentar ya Sensei...`, m);

        let { images, videos } = await snapins(args[0]);

        if (images.length === 0 && videos.length === 0) {
            return conn.reply(m.chat, 'Maaf Sensei, Arona tidak menemukan gambar atau video dari link itu. Mungkin link-nya salah atau postingannya privat?', m);
        }

        if (images.length > 0) {
            await conn.reply(m.chat, `📷 Arona menemukan ${images.length} foto, akan segera dikirim...`, m);
            for (const img of images) {
                await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Jeda 1 detik
            }
        }

        if (videos.length > 0) {
            await conn.reply(m.chat, `🎥 Arona menemukan ${videos.length} video, akan segera dikirim...`, m);
            for (const vid of videos) {
                await conn.sendMessage(m.chat, { video: { url: vid } }, { quoted: m });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Jeda 1 detik
            }
        }
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `Waduh, sepertinya ada masalah, Sensei. Gagal mengambil data: ${e.message}`, m);
    }
}

handler.command = ['ig', 'igdl', 'instagram']
handler.help = ['ig']
handler.tags = ['downloader']

module.exports = handler
