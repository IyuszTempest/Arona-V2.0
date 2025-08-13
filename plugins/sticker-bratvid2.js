const axios = require('axios')
const fs = require('fs')
const { exec } = require('child_process')
const { tmpdir } = require('os')
const path = require('path')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    text = text || (m.quoted && (
        m.quoted.text || 
        m.quoted.caption || 
        m.quoted.description
    )) || ''

    if (!text) throw `Contoh penggunaan: ${usedPrefix + command} Nama Kamu`

    try {
        const apiUrl = `https://api.betabotz.eu.org/api/maker/brat-video?text=${encodeURIComponent(text)}&apikey=F6F411`
        const tmpMp4 = path.join(tmpdir(), `${Date.now()}.mp4`)
        const tmpWebp = path.join(tmpdir(), `${Date.now()}.webp`)

        // Download video
        const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        fs.writeFileSync(tmpMp4, data)

        // Convert to animated WebP with ffmpeg + metadata for WA sticker (packname & author)
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -y -i "${tmpMp4}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 6 -an -vsync 0 -c:v libwebp -metadata:s title="bratvid" -metadata:s comment="packname=Bot Arona Multidevice;author=Iyusz_Tempest" "${tmpWebp}"`, (err) => {
                if (err) return reject(err)
                resolve()
            })
        })

        // Kirim stiker
        await conn.sendFile(m.chat, tmpWebp, 'brat.webp', '', m)

        // Bersihkan file sementara
        fs.unlinkSync(tmpMp4)
        fs.unlinkSync(tmpWebp)

    } catch (e) {
        console.error('[BRATVID ERROR]', e)
        await conn.reply(m.chat, `Gagal membuat stiker brat!\n\nError: ${e.message || e}`, m)
    }
}

handler.command = handler.help = ['bratvid2']
handler.tags = ['sticker']
handler.limit = true
handler.register = true

module.exports = handler