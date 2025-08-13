const fetch = require('node-fetch');

let handler = async (m) => {
    try {
        await m.reply('Sedang mengambil informasi anime yang sedang tayang...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mendapatkan informasi anime yang sedang tayang
        const apiUrl = 'https://api.siputzx.my.id/api/anime/otakudesu/ongoing';
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.status || !data.data || data.data.length === 0) {
            throw 'Tidak ada anime yang sedang tayang saat ini';
        }

        // Menyusun pesan dengan informasi anime
        let caption = 'Anime yang Sedang Tayang:\n\n';
        data.data.forEach(anime => {
            caption += `∘ Judul: ${anime.title}\n`;
            caption += `   Episode: ${anime.episode}\n`;
            caption += `   Tipe: ${anime.type}\n`;
            caption += `   Tanggal: ${anime.date}\n`;
            caption += `   Link: ${anime.link}\n`;
            caption += `   Gambar: ${anime.image}\n\n`;
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

handler.command = handler.help = ['ongoing', 'animeongoing','animebaru'];
handler.tags = ['anime','news'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;