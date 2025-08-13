/*PLUGINS CJS 
Image To Sketch
*Sumber:* https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*Scrape Asli:* https://whatsapp.com/channel/0029Vaf07jKCBtxAsekFFk3i
*/

const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const FormData = require('form-data');
const { Readable } = require('stream');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function generateSessionHash() {
    return crypto.randomBytes(16).toString('hex');
}

async function imageToSketch(imageBuffer) {
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('Image buffer is required');
    }

    const sessionHash = generateSessionHash();
    const api_url = 'https://raec25-image-to-drawing-sketch.hf.space/gradio_api';
    const file_url_base = 'https://raec25-image-to-drawing-sketch.hf.space/gradio_api/file=';

    const filename = `${Date.now()}_zennxz.jpg`;
    const form = new FormData();
    form.append('files', imageBuffer, {
        filename,
        contentType: 'image/jpeg',
    });

    const uploadHeaders = {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://raec25-image-to-drawing-sketch.hf.space/'
    };

    const uploadRes = await axios.post(
        `${api_url}/upload?upload_id=${sessionHash}`,
        form,
        { headers: uploadHeaders }
    );
    
    if (!uploadRes.data || !uploadRes.data[0]) {
        throw new Error('Upload gambar ke Gradio gagal atau respons tidak valid.');
    }
    
    const filePath = uploadRes.data[0];
    const filePathUrl = `${file_url_base}${filePath}`;

    const payload = {
        data: [
            {
                path: filePath,
                url: filePathUrl,
                orig_name: filename,
                size: imageBuffer.length,
                mime_type: 'image/jpeg',
                meta: { _type: 'gradio.FileData' }
            },
            "Pencil Sketch" 
        ],
        event_data: null,
        fn_index: 2, 
        trigger_id: 13, 
        session_hash: sessionHash
    };

    await axios.post(
        `${api_url}/queue/join?__theme=system`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
    );

    let resultUrl = null;
    let pollingAttempts = 0;
    const maxPollingAttempts = 60;
    const pollingInterval = 1000;

    while (!resultUrl && pollingAttempts < maxPollingAttempts) {
        const checkStatusUrl = `${api_url}/queue/data?session_hash=${sessionHash}`;
        const checkStatusRes = await axios.get(checkStatusUrl);
        const lines = checkStatusRes.data.split('\n\n');

        for (const line of lines) {
            if (line.startsWith('data:')) {
                const d = JSON.parse(line.substring(6));
                if (d.msg === 'process_completed' && d.output?.data?.[0]?.url) {
                    resultUrl = d.output.data[0].url;
                    break;
                }
                if (d.msg === 'process_failed' || d.msg === 'queue_full') {
                    throw new Error(`Kondisi HF Space: ${d.msg}. Gagal memproses gambar.`);
                }
            }
        }
        if (!resultUrl) {
            pollingAttempts++;
            await delay(pollingInterval);
        }
    }

    if (!resultUrl) {
        throw new Error('Timeout: Gagal mendapatkan URL gambar sketsa.');
    }
    
    return resultUrl;
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
        return conn.reply(m.chat, `Silahkan kirim atau reply gambar dengan caption *${usedPrefix + command}* untuk diubah menjadi sketsa.`, fkontak);
    }

    if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 10 * 1024 * 1024) { 
        return conn.reply(m.chat, 'Ukuran gambar terlalu besar! Maksimal 10 MB ya, masbro.', fkontak);
    }
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        let imageBuffer = await q.download();
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Gagal mengunduh gambar dari pesan.');
        }

        await conn.reply(m.chat, '🔄 *Memulai proses konversi ke sketsa...*', fkontak);
        const sketchUrl = await imageToSketch(imageBuffer);
        
        if (!sketchUrl) {
            throw new Error('Gagal mendapatkan URL gambar sketsa.');
        }

        await conn.sendMessage(m.chat, {
            image: { url: sketchUrl },
            caption: `✅ *Done! Gambar Anda diubah menjadi sketsa pensil.*`,
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Image to Sketch:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat memproses gambar: ${e.message}. Coba lagi nanti ya.`, fkontak);
    }
};

handler.help = ['tosketch'];
handler.tags = ['ai', 'image', 'tools', 'premium']; 
handler.command = /^(tosketch)$/i;
handler.limit = true; 
handler.premium = true; 

module.exports = handler;