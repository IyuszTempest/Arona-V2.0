const axios = require('axios');
const cheerio = require('cheerio'); // Menggunakan require untuk CommonJS
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

let handler = async (m, { conn, text, usedPrefix, command }) => { // Tambahkan usedPrefix
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

    const _type = ['removebg', 'enhance', 'upscale', 'restore', 'colorize'];

    if (!text) {
        let listTools = _type.map(v => `> ${v}`).join('\n');
        return conn.reply(m.chat, `*List Tools Image:*\n\n${listTools}\n\n*Contoh penggunaan:*\n*${usedPrefix + command}* removebg\n\n_Silakan kirim atau reply gambar dengan caption_`, fkontak);
    }
    if (!_type.includes(text.toLowerCase())) { // Pastikan text lowercase untuk cek
        let listTools = _type.map(v => `> ${v}`).join('\n');
        return conn.reply(m.chat, `Kamu masukin tipe apa sih, masbro?\n\n*List Tools Image:*\n${listTools}`, fkontak);
    }

    let buffer;
    if (m.quoted && m.quoted.mimetype?.includes('image')) {
        buffer = await m.quoted.download();
    } else if (m.mimetype?.includes('image')) { // Jika gambar langsung dikirim tanpa reply
        buffer = await m.download();
    } else {
        return conn.reply(m.chat, `Silakan reply atau kirim gambar dengan caption: *${usedPrefix + command}* ${text}\n\n_Gambar yang diupload harus jelas ya, masbro._`, fkontak);
    }

    if (!buffer || buffer.length === 0) {
        return conn.reply(m.chat, 'Gagal mengunduh gambar dari pesan.', fkontak);
    }

    // Batasi ukuran file (misal 5MB, sesuai kemampuan API/bot)
    if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 5 * 1024 * 1024) { 
        return conn.reply(m.chat, 'Ukuran gambar terlalu besar! Maksimal 5 MB ya, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const form = new FormData();
        form.append('file', buffer, `image.${m.mimetype.split('/')[1] || 'jpg'}`); // Gunakan ekstensi asli
        form.append('type', text.toLowerCase()); // Kirim tipe dalam lowercase

        const headers = {
            ...form.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Tambah User-Agent
            'Referer': 'https://imagetools.rapikzyeah.biz.id/' // Tambah Referer
        };

        const res = await axios.post('https://imagetools.rapikzyeah.biz.id/upload', form, {
            headers: headers
        });

        const $ = cheerio.load(res.data);
        const resultUrl = $('img#memeImage').attr('src'); // Scrape URL gambar hasil

        if (!resultUrl) {
            throw new Error('Tidak ada gambar hasil yang ditemukan. Mungkin API gagal memproses.');
        }

        await conn.sendMessage(m.chat, {
            image: { url: resultUrl },
            caption: `✅ *Done!* Hasil *${text}* gambar Anda.\n\n_Sumber: imagetools.rapikzyeah.biz.id_`
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } catch (e) {
        console.error('Error di plugin Image Tools:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        // Lebih spesifik jika error dari response Axios
        if (e.response && e.response.data) {
            await conn.reply(m.chat, `❌ Eror kak: API Error (${e.response.status}) - ${e.response.data.message || e.response.data.toString()}. Coba lagi nanti ya.`, fkontak);
        } else {
            await conn.reply(m.chat, `❌ Eror kak: ${e.message}. Coba lagi nanti ya.`, fkontak);
        }
    }
}

handler.help = ['imgtools <type>'];
handler.tags = ['tools', 'image','premium'];
handler.command = ['imgtools']; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = true;

module.exports = handler;