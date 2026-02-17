const axios = require('axios'); // Menggunakan require untuk CommonJS

async function SnackVideo(url) {
    try {
        const response = await axios.post('https://api.snackdownloader.com/get-data', {
            url: url
        }, {
            headers: {
                'content-type': 'application/json',
                'origin': 'https://snackdownloader.com',
                'referer': 'https://snackdownloader.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
            }
        });
        const { video } = response.data; // Asumsi 'video' adalah properti langsung yang berisi URL video
        if (!video) throw new Error('Gagal mengambil video. Cek linknya atau tidak ada video ditemukan!');
        return {
            status: true,
            videoUrl: video // Ubah nama properti untuk kejelasan
        };
    } catch (err) {
        console.error('Error in SnackVideo scraper:', err.message);
        // Jika ada respons dari server (misal error 4xx/5xx)
        if (err.response && err.response.data && err.response.data.message) {
            return {
                status: false,
                message: err.response.data.message
            };
        }
        return {
            status: false,
            message: err.message || 'Terjadi kesalahan tidak diketahui.'
        };
    }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) {
        return conn.reply(m.chat, `Mana link Snack Video-nya, masbro? Contoh: *${usedPrefix + command}* https://www.snackvideo.com/@user/video/xxxxxxxx`, fkontak);
    }

    // Validasi sederhana untuk link Snack Video
    if (!text.includes('snackvideo.com') && !text.includes('sck.io')) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link Snack Video yang valid, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const result = await SnackVideo(text);

        if (result.status && result.videoUrl) {
            await conn.sendMessage(m.chat, {
                video: { url: result.videoUrl },
                caption: `✅ *Video Snack Video Ditemukan!*`,
                mimetype: 'video/mp4', // Asumsi format video adalah mp4
                fileName: `snackvideo.mp4`
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            await conn.reply(m.chat, `Gagal download video Snack Video: ${result.message}`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } catch (e) {
        console.error('Error di plugin Snack Video Downloader:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mendownload Snack Video: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['snackvideo <url>'];
handler.tags = ['downloader'];
handler.command = /^(snackvideo)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;
