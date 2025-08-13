/*
 • Fitur By Anomaki Team
 • Created : xyzan code
 • Remini Image
 • Jangan Hapus Wm
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
 
- Rest api gratis
https://www.apis-anomaki.zone.id
*/

const fetch = require('node-fetch')
const FormData = require('form-data')

const handler = async (m, {
    conn
}) => {
    if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes('image'))
        return conn.reply(m.chat, 'Reply gambarnya.', m)

    const r = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟']
    let rindex = 0
    let done = false

    const rloop = setInterval(async () => {
        if (done) return clearInterval(rloop)
        await conn.sendMessage(m.chat, {
            react: {
                text: r[rindex % r.length],
                key: m.key
            }
        })
        rindex++
    }, 1500)

    const qimg = await m.quoted.download()
    const url = await upcatbox(qimg)
    if (!url) {
        done = true
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        })
        return conn.reply(m.chat, 'Gagal upload gambar.', m)
    }

    const api = `https://www.apis-anomaki.zone.id/ai/ai-remini?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const json = await res.json()

    done = true

    if (!json?.status || !json.result?.success || !json.result.result) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        })
        return conn.reply(m.chat, 'Gagal dari api.', m)
    }

    await conn.sendMessage(m.chat, {
        react: {
            text: '✅',
            key: m.key
        }
    })
    await conn.sendMessage(m.chat, {
        image: {
            url: json.result.result
        },
        caption: 'Done'
    }, {
        quoted: m
    })
}

handler.help = ['remini']
handler.tags = ['ai','tools']
handler.command = /^remini$/i
handler.limit = 2

module.exports = handler;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function upcatbox(buffer) {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, 'image.jpg')

    try {
        const res = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form
        })
        const text = await res.text()
        if (!text.startsWith('http')) return null
        return text.trim()
    } catch {
        return null
    }
}