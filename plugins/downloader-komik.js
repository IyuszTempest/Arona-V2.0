const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan URL komik yang ingin diunduh!';

    try {
        await m.reply('Sedang mengambil informasi unduhan...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mendapatkan informasi unduhan
        const apiUrl = `https://api.siputzx.my.id/api/anime/komikindo-download?url=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.status || !data.data || data.data.length === 0) {
            throw 'Tidak ada informasi unduhan yang ditemukan';
        }

        // Menyusun pesan dengan informasi unduhan
        let caption = 'Link Unduhan Gambar Komik:\n\n';
        data.data.forEach((imageUrl, index) => {
            caption += `∘ Gambar ${index + 1}: ${imageUrl}\n`;
        });

        // Mengirim pesan dengan informasi unduhan
        await conn.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['downloadkomik', 'unduhkomik'];
handler.tags = ['downloader'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;