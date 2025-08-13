const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
    if (!text) throw 'Masukkan pesan yang ingin kamu kirim!';

    try {
        await m.reply('Sedang memproses...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mendapatkan respons
        const apiUrl = `https://api.vreden.web.id/api/mora?query=${encodeURIComponent(text)}&username=${encodeURIComponent(m.sender)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.result) {
            throw 'Tidak ada respons dari Mora';
        }

        // Mengirimkan hasil
        await conn.sendMessage(m.chat, {
            text: data.result
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['mora', 'chatmora'];
handler.tags = ['ai'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;