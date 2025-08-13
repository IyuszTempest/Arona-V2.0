const axios = require('axios');
const fs = require('fs');
const https = require('https');
const { Readable } = require('stream'); // Butuh stream untuk multipart/form-data
const FormData = require('form-data'); // Butuh FormData untuk kirim file

// --- PENTING: AMANKAN API KEY INI DI ENVIRONMENT VARIABLE! ---
const PHOTOROOM_API_KEY = process.env.PHOTOROOM_API_KEY || 'sk_pr_default_b528b12957583433ca610b5c1f7a92bac7ecb2fc';

async function removeBackground(buffer) { // Ubah agar menerima buffer langsung
    return new Promise(async (resolve, reject) => {
        const boundary = '--------------------------' + Date.now().toString(16);
        const endpoint = 'https://sdk.photoroom.com/v1/segment';

        const form = new FormData();
        form.append('image_file', buffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        const headers = {
            ...form.getHeaders(),
            'X-API-Key': PHOTOROOM_API_KEY,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.photoroom.com/'
        };

        try {
            const res = await axios.post(endpoint, form, {
                headers,
                responseType: 'arraybuffer'
            });

            const isImage = res.headers['content-type']?.includes('image');
            if (!isImage) {
                // Jika respons bukan gambar, coba parse sebagai JSON untuk pesan error
                const errorText = res.data.toString('utf8');
                let errorJson;
                try {
                    errorJson = JSON.parse(errorText);
                } catch (e) {
                    errorJson = { error: errorText };
                }
                
                if (res.status === 402) { // Kode 402 biasanya untuk limit/kuota habis
                    reject(new Error('❌ Gagal: Limit API PhotoRoom sudah habis bulan ini!'));
                } else {
                    reject(new Error(`API mengembalikan error: ${errorJson.error?.message || errorJson.error || res.statusText}`));
                }
                return;
            }

            resolve(Buffer.from(res.data)); // Mengembalikan buffer gambar
        } catch (error) {
            console.error('Error saat request ke PhotoRoom:', error.message);
            if (error.response?.status === 402) {
                 reject(new Error('❌ Gagal: Limit API PhotoRoom sudah habis bulan ini!'));
            } else if (error.response?.data) {
                 const errorText = error.response.data.toString('utf8');
                 reject(new Error(`API Error: ${errorText}`));
            } else {
                 reject(error);
            }
        }
    });
}

let handler = async (m, { conn, usedPrefix, command }) => {
    // Definisi fkontak
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
    
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime.startsWith('image/')) {
        return conn.reply(m.chat, `Silakan kirim atau reply gambar dengan caption *${usedPrefix + command}* untuk menghapus background-nya.`, fkontak);
    }
    
    if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 5 * 1024 * 1024) { 
        return conn.reply(m.chat, 'Ukuran gambar terlalu besar! Maksimal 5 MB ya, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu
    await conn.reply(m.chat, `⏳ *Memproses gambar...* Mohon tunggu.`, fkontak);

    try {
        const imageBuffer = await q.download();
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Gagal mengunduh gambar dari pesan.');
        }

        const resultBuffer = await removeBackground(imageBuffer);

        if (!resultBuffer || resultBuffer.length === 0) {
            throw new Error('Tidak ada gambar hasil yang diterima dari API.');
        }

        await conn.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `✅ *Done! Background berhasil dihapus.*`,
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin PhotoRoom:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan: ${e.message}`, fkontak);
    }
};

handler.help = ['removebg2'];
handler.tags = ['tools', 'image', 'premium'];
handler.command = /^(removebg2)$/i;
handler.limit = true;
handler.premium = true; // Karena API berbayar / terbatas

module.exports = handler;