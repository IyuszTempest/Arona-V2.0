const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan judul komik yang ingin dicari!';

    try {
        await m.reply('Sedang mencari komik...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mencari komik
        const apiUrl = `https://api.siputzx.my.id/api/anime/komikindo-serach?query=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.status || !data.data || data.data.length === 0) {
            throw 'Komik tidak ditemukan';
        }

        // Menyusun pesan dengan informasi komik
        let caption = 'Hasil Pencarian Komik:\n\n';
        data.data.forEach(komik => {
            caption += `∘ Judul: ${komik.title}\n`;
            caption += `   Link: ${komik.href}\n`;
            caption += `   Gambar: ${komik.image}\n`;
            caption += `   Rating: ${komik.rating}\n\n`;
        });

        // Mengirim pesan dengan informasi komik
        await conn.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['komik', 'carikomik'];
handler.tags = ['anime'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;