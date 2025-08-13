/* plugins bratvid type cjs
  tqto kiuur 
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029VbB2nGuDZ4LWVu9nlY1h
   ai yang buat bang jadi gak kaku tangan ku coding😹*/


const axios = require('axios')
const fs = require('fs')
const { exec } = require('child_process')
const { tmpdir } = require('os')
const path = require('path')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let text = args.join(' ') || (m.quoted && m.quoted.text)
        if (!text) return m.reply(`🚩 Gunakan: *${usedPrefix + command} teks*\nContoh: *${usedPrefix + command} Halo Halo*`)

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const apiUrl = `https://api.privatezia.biz.id/api/generator/bratvid?text=${encodeURIComponent(text)}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        if (response.status !== 200) throw new Error("🚩 Gagal mendapatkan GIF dari API.")

        const gifPath = path.join(tmpdir(), `bratvid_${Date.now()}.gif`)
        const webpPath = path.join(tmpdir(), `bratvid_${Date.now()}.webp`)
        fs.writeFileSync(gifPath, response.data)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${gifPath} -vf "scale=512:512:flags=lanczos" -loop 0 -preset default ${webpPath}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, {
            sticker: fs.readFileSync(webpPath)
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

        fs.unlinkSync(gifPath)
        fs.unlinkSync(webpPath)

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        m.reply(`🚩 Terjadi kesalahan:\n\n${e.message}`)
    }
}

handler.help = ['bratvid', 'bratvideo']
handler.tags = ['sticker']
handler.command = /^brat(vid|video)$/i
handler.limit = 5
handler.register = true

module.exports = handler