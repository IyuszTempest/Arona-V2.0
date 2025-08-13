let { sticker5 } = require('../lib/sticker.js')
let axios = require('axios')

let handler = async (m, { conn, args }) => {
    let text = args.slice(0).join(" ") // Mengambil semua argumen sebagai teks utama
    let quotedMessage = null
    let quotedSenderName = null
    let quotedSenderPp = null

    // Cek apakah ada pesan yang di-reply
    if (m.quoted) {
        quotedMessage = m.quoted.text
        quotedSenderName = await conn.getName(m.quoted.sender)
        quotedSenderPp = await conn.profilePictureUrl(m.quoted.sender, 'image').catch(_ => 'https://telegra.ph/file/320b066dc81928b782c7b.png')
    }

    // Jika tidak ada argumen atau reply, lempar error
    if (!text && !m.quoted) {
        throw "Input teks atau reply teks yang ingin di jadikan quote!"
    }

    // Tentukan teks utama dan nama pengirim utama di quote
    let mainText = ""
    let mainSenderName = ""
    let mainSenderPp = ""

    if (text) { // Jika ada teks setelah perintah .qc
        mainText = text
        mainSenderName = m.pushName // Nama pengguna yang menjalankan perintah
        mainSenderPp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/320b066dc81928b782c7b.png')
    } else if (m.quoted) { // Jika tidak ada teks setelah perintah, tapi ada pesan yang di-reply
        mainText = quotedMessage
        mainSenderName = quotedSenderName // Nama pengirim dari pesan yang di-reply
        mainSenderPp = quotedSenderPp
        // Kosongkan variabel quotedMessage agar tidak jadi nested reply
        quotedMessage = null
        quotedSenderName = null
        quotedSenderPp = null
    }

    if (!mainText) return m.reply('Masukin teks utama ya, Yus!')
    if (mainText.length > 100) return m.reply('Maksimal 100 karakter teks aja ya, Yus!')

    let apiColor = '#262D31'; // Kode HEX untuk warna putih

    const messagesArray = [{
        "entities": [],
        "avatar": true,
        "from": {
            "id": 1,
            "name": mainSenderName, // Menggunakan nama pengirim utama yang sudah ditentukan
            "photo": {
                "url": mainSenderPp
            }
        },
        "text": mainText,
        "replyMessage": {}
    }]

    // Jika ada quoted message (yang bukan jadi mainText), tambahkan sebagai replyMessage
    if (quotedMessage) {
        messagesArray[0].replyMessage = {
            "name": quotedSenderName,
            "text": quotedMessage,
            "chatId": 2, // Ini id chat dummy, bisa disesuaikan kalau ada kebutuhan
            "avatar": true,
            "photo": {
                "url": quotedSenderPp
            }
        }
    }

    const obj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": apiColor,
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": messagesArray
    }

    try {
        const json = await axios.post('https://qc.botcahx.eu.org/generate', obj, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const buffer = Buffer.from(json.data.result.image, 'base64')
        let stiker = await sticker5(buffer, false, global.packname, global.author)
        if (stiker) return conn.sendFile(m.chat, stiker, 'Quotly.webp', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Waduh, gagal bikin quotenya masbro. Coba lagi nanti ya.')
    }
}

handler.help = ['qchitam'];
handler.tags = ['sticker'];
handler.command = /^(qchitam|quotelyhitam)$/i
handler.limit = true;

module.exports = handler