const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan kata kunci untuk pencarian!';

    try {
        await m.reply('Sedang mencari...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mendapatkan respons
        const apiUrl = `https://api.vreden.web.id/api/simi?query=${encodeURIComponent(text)}&lang=id`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (data.status !== 200) {
            throw 'Tidak ada hasil ditemukan';
        }

        // Mengambil hasil dari respons
        const result = data.result;

        // Mengirimkan hasil
        await conn.sendMessage(m.chat, {
            text: `Hasil:\n${result}`
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['simi', 'simisimi'];
handler.tags = ['fun'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;