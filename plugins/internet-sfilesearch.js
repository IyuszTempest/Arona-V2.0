const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan kata kunci untuk pencarian!';

    try {
        await m.reply('Sedang mencari...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mencari file
        const apiUrl = `https://api.vreden.web.id/api/sfile-search?query=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (data.status !== 200 || !data.result || data.result.length === 0) {
            throw 'File Tidak Ditemukan';
        }

        // Menyusun pesan dengan hasil pencarian
        let caption = 'Hasil Pencarian:\n\n';
        data.result.forEach((file, index) => {
            caption += `∘ ${index + 1}. Judul: ${file.title}\n`;
            caption += `   Ukuran: ${file.size}\n`;
            caption += `   Link: ${file.link}\n\n`;
        });

        // Mengirim pesan dengan informasi file
        await conn.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['sfile', 'sfilesearch'];
handler.tags = ['internet'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;