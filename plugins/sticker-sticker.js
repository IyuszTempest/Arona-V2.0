const fs = require('fs')

let handler = async (m, { conn, command, usedPrefix }) => {
    // Definisi fkontak di sini untuk plugin ini
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (/image/.test(mime)) {
        let media = await q.download()
        // Asumsi stiker_wait sudah didefinisikan sebagai global atau di scope yang bisa diakses
        // Jika tidak, ganti dengan pesan teks biasa, contoh: m.reply("Sedang membuat stiker, mohon tunggu...");
        await conn.reply(m.chat, global.stiker_wait || "Sedang membuat stiker, mohon tunggu...", fkontak); // Pakai fkontak dan global.stiker_wait

        let encmedia = await conn.sendImageAsSticker(m.chat, media, fkontak, { // Pakai fkontak untuk quoted
            packname: global.packname,
            author: global.author
        });
        await fs.unlinkSync(encmedia);
    } else if (/video/.test(mime)) {
        if ((q.msg || q).seconds > 7) return conn.reply(m.chat, 'Durasi video maksimal 6 detik!', fkontak); // Pakai fkontak

        let media = await q.download();
        // Asumsi stiker_wait sudah didefinisikan sebagai global atau di scope yang bisa diakses
        await conn.reply(m.chat, global.stiker_wait || "Sedang membuat stiker, mohon tunggu...", fkontak); // Pakai fkontak dan global.stiker_wait

        let encmedia = await conn.sendVideoAsSticker(m.chat, media, fkontak, { // Pakai fkontak untuk quoted
            packname: global.packname,
            author: global.author
        });
        await fs.unlinkSync(encmedia);
    } else {
        throw conn.reply(m.chat, `Kirim Gambar/Video Dengan Caption ${usedPrefix + command}\nDurasi Video 1-6 Detik`, fkontak); // Pakai fkontak
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^(stiker|s|sticker)$/i
handler.limit = true
module.exports = handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'))
}
