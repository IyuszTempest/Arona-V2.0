const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

async function transcribe(buffer, mimeType = 'audio/mpeg') { // Tambah mimeType
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Audio buffer diperlukan.');

    const form = new FormData();
    // Gunakan mimeType asli dan ekstensi yang sesuai
    const filename = `audio_${Date.now()}.${mimeType.split('/')[1] || 'mp3'}`; 
    form.append('file', buffer, filename);

    const headers = {
        ...form.getHeaders(),
        'Content-Length': await new Promise((resolve, reject) => {
            form.getLength((err, length) => {
                if (err) reject(err);
                else resolve(length);
            });
        }),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Tambah User-Agent
        'Referer': 'https://752web.workers.dev/' // Tambah Referer
    };

    try {
        const { data } = await axios.post(
            'https://audio-transcription-api.752web.workers.dev/api/transcribe',
            form,
            { headers }
        );

        if (!data || !data.transcription) {
            throw new Error(data.message || 'Tidak ada transkrip yang diterima dari API.');
        }
        return data.transcription;
    } catch (err) {
        console.error('Error in transcribe function:', err.message);
        if (err.response && err.response.data) {
            console.error('API Response Data:', err.response.data.toString());
            throw new Error(`API Error: ${err.response.data.message || err.response.data.toString()}`);
        }
        throw new Error(`Gagal mengubah audio ke teks: ${err.message}`);
    }
}

let handler = async (m, { conn, usedPrefix, command }) => { // Tambahkan usedPrefix
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

    if (!m.quoted || !m.quoted.mimetype?.includes('audio')) {
        return conn.reply(m.chat, `Silakan reply audio (voice note atau file audio) yang mau diubah ke teks.\n\nContoh: Reply audio dengan caption *${usedPrefix + command}*`, fkontak); // Pakai fkontak
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const buffer = await m.quoted.download();
        const mimeType = m.quoted.mimetype; // Ambil mime type asli audio
        
        const text = await transcribe(buffer, mimeType);

        if (!text || text.trim().length === 0) {
            throw new Error('Transkripnya kosong, masbro, coba audio lain atau pastikan audio jelas.');
        }

        await conn.reply(m.chat, `✅ *Hasil Transkrip Audio:*\n\n\`\`\`${text}\`\`\``, fkontak); // Pakai fkontak
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } catch (e) {
        console.error('Error di plugin Audio to Text:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        await conn.reply(m.chat, `❌ Eror kak: ${e.message}. Pastikan audio jelas dan tidak terlalu panjang.`, fkontak); // Pakai fkontak
    }
};

handler.help = ['audio2text'];
handler.tags = ['tools']; // Tambah tag 'audio'
handler.command = ['audio2text', 'audiototext']; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;