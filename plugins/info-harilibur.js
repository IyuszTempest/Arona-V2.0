const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
    try {
        await m.reply('Sedang mengambil informasi hari libur nasional...'); // Ganti dengan variabel wait jika ada

        // Menggunakan API untuk mendapatkan informasi hari libur nasional
        const apiUrl = 'https://api.siputzx.my.id/api/info/liburnasional';
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Memeriksa status respons
        if (!data.status) {
            throw 'Tidak ada data hari libur nasional';
        }

        // Mengambil data hari ini dan mendatang
        const today = data.data.hari_ini;
        const upcomingEvents = data.data.mendatang.event_nasional;

        // Menyusun pesan dengan informasi hari libur
        let caption = `Hari Ini (${today.tanggal}):\n`;
        if (today.events.length > 0) {
            today.events.forEach(event => {
                caption += `- ${event}\n`;
            });
        } else {
            caption += 'Tidak ada acara hari ini.\n';
        }

        caption += `\nHari Libur Mendatang:\n`;
        upcomingEvents.forEach(event => {
            caption += `∘ Tanggal: ${event.date} - ${event.event} (Sumber: ${event.source}) - ${event.daysUntil} hari lagi\n`;
        });

        // Mengirim pesan dengan informasi hari libur
        await conn.sendMessage(m.chat, {
            text: caption
        }, {
            quoted: m
        });

    } catch (e) {
        conn.reply(m.chat, 'Terjadi kesalahan: ' + e.message, m);
    }
};

handler.command = handler.help = ['liburnasional2', 'libur2','harilibur2'];
handler.tags = ['info'];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;