const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan nama anime yang ingin dicari!';

    try {
        await m.reply('Sedang mencari anime...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mencari anime
        const apiUrl = `https://api.siputzx.my.id/api/anime/otakudesu/search?s=${encodeURIComponent(text)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.status || !data.data || data.data.length === 0) {
            throw 'Anime tidak ditemukan';
        }

        // Menyusun pesan dengan informasi anime
        let caption = 'Hasil Pencarian Anime:\n\n';
        data.data.forEach(anime => {
            caption += `∘ Judul: ${anime.title}\n`;
            caption += `   Link: ${anime.link}\n`;
            caption += `   Genre: ${anime.genres}\n`;
            caption += `   Status: ${anime.status}\n`;
            caption += `   Rating: ${anime.rating}\n`;
            caption += `   Gambar: ${anime.imageUrl}\n\n`;
        });

        // Mengirim pesan dengan informasi anime
        await conn.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['carianime','otakudesusearch','otakudesu'];
handler.tags = ['anime'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;