const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS

// Helper function untuk delay (dipindahkan ke sini agar reusable)
const delay = (ms) => new Promise(res => setTimeout(res, ms));

class MusicScope {
    constructor() {
        this.api_url = 'https://ziqiangao-musicscopegen.hf.space/gradio_api';
        this.file_url = 'https://ziqiangao-musicscopegen.hf.space/gradio_api/file=';
    }

    generateSession() {
        return Math.random().toString(36).substring(2);
    }

    async upload(buffer, filename, mimeType) { // Tambah mimeType
        const upload_id = this.generateSession();
        const form = new FormData();
        form.append('files', buffer, { filename, contentType: mimeType }); // Tambah contentType

        try {
            const { data } = await axios.post(`${this.api_url}/upload?upload_id=${upload_id}`, form, {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': this.api_url
                }
            });
            if (!data || !data[0]) throw new Error('Upload gagal atau respons tidak valid dari server.');
            return { orig_name: filename, path: data[0], url: `${this.file_url}${data[0]}` };
        } catch (error) {
            console.error('Error uploading file to HF Space:', error.message);
            if (error.response && error.response.data) {
                console.error('HF Space Upload API Response:', error.response.data.toString());
            }
            throw new Error(`Gagal upload file ke server: ${error.message}`);
        }
    }

    async process({ title = 'MusicScope', artist = 'ZenzzXD', audio, audioMimeType, image, imageMimeType } = {}) { // Tambah audioMimeType, imageMimeType
        if (!audio || !Buffer.isBuffer(audio)) throw new Error('Audio buffer diperlukan.');
        if (!image || !Buffer.isBuffer(image)) throw new Error('Image buffer diperlukan.');

        await new Promise(resolve => setTimeout(resolve, 500)); // Delay kecil sebelum upload
        const audio_url = await this.upload(audio, `audio_${Date.now()}.mp3`, audioMimeType);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay kecil
        const image_url = await this.upload(image, `image_${Date.now()}.jpg`, imageMimeType);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay kecil
        const session_hash = this.generateSession();

        const payload = {
            data: [
                { path: audio_url.path, url: audio_url.url, orig_name: audio_url.orig_name, size: audio.length, mime_type: 'audio/mpeg', meta: { _type: 'gradio.FileData' } }, // Asumsi audio/mpeg
                null, // Ini mungkin untuk input video (kosong)
                'Output', // Ini output format/name
                30, // durasi?
                1280, // width
                720, // height
                1024, // bitrate?
                { path: image_url.path, url: image_url.url, orig_name: image_url.orig_name, size: image.length, mime_type: 'image/jpeg', meta: { _type: 'gradio.FileData' } }, // Asumsi image/jpeg
                title,
                artist
            ],
            event_data: null,
            fn_index: 0, // Ini bisa berubah kalau API-nya update
            trigger_id: 26, // Ini juga bisa berubah
            session_hash: session_hash
        };

        try {
            await axios.post(`${this.api_url}/queue/join?`, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            let resultVideoUrl;
            let pollingAttempts = 0;
            const maxPollingAttempts = 90; // Maksimal 90 percobaan (1.5 menit jika interval 1s)
            const pollingInterval = 1000; // Cek setiap 1 detik

            while (!resultVideoUrl && pollingAttempts < maxPollingAttempts) {
                const { data } = await axios.get(`${this.api_url}/queue/data?session_hash=${session_hash}`);
                const lines = data.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const d = JSON.parse(line.slice(6));
                        if (d.msg === 'process_completed' && d.output?.data?.[0]?.video?.url) {
                            resultVideoUrl = d.output.data[0].video.url;
                            break;
                        } else if (d.msg === 'queue_full' || d.msg === 'process_failed') {
                            throw new Error(`HF Space Status: ${d.msg}. Gagal memproses Musicscope.`);
                        }
                    }
                }
                if (!resultVideoUrl) {
                    pollingAttempts++;
                    await delay(pollingInterval);
                }
            }

            if (!resultVideoUrl) throw new Error('Timeout: Gagal mendapatkan video Musicscope.');
            return resultVideoUrl;
        } catch (error) {
            console.error('Error processing Musicscope:', error.message);
            if (error.response && error.response.data) {
                console.error('HF Space Process API Response:', error.response.data.toString());
            }
            throw new Error(`Gagal memproses video: ${error.message}`);
        }
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) return conn.reply(m.chat, `Contoh: *${usedPrefix + command}* Judul|Artis|URL_Gambar (balas audio)\n\n*Catatan:* Gambar harus berupa URL langsung, dan balas audio MP3-nya.`, fkontak);

    let [title, artist, imgUrl] = text.split('|').map(v => v.trim());
    if (!title || !artist || !imgUrl) {
        return conn.reply(m.chat, `Format salah. Contoh: *${usedPrefix + command}* judul|artis|url_gambar (reply audio)`, fkontak);
    }
    if (!imgUrl.startsWith('http')) {
        return conn.reply(m.chat, 'URL Gambar tidak valid. Harus dimulai dengan http(s)://', fkontak);
    }

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/^audio/.test(mime)) return conn.reply(m.chat, 'Balas dengan audio MP3-nya ya, masbro.', fkontak);
    
    // Batasi ukuran file audio/gambar (misal 10MB)
    if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 10 * 1024 * 1024) { 
        return conn.reply(m.chat, 'Ukuran audio terlalu besar! Maksimal 10 MB ya, masbro.', fkontak);
    }
    // Asumsi gambar juga tidak boleh terlalu besar
    // Nanti ada validasi gambar di `axios.get(imgUrl)` juga

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        let audioBuffer = await q.download();
        if (!audioBuffer || audioBuffer.length === 0) throw new Error('Gagal mengunduh audio.');
        
        await conn.reply(m.chat, '⏳ *Mengunduh gambar...*', fkontak);
        const imageBuffer = (await axios.get(imgUrl, { responseType: 'arraybuffer' })).data;
        if (!imageBuffer || imageBuffer.length === 0) throw new Error('Gagal mengunduh gambar.');
        
        // Asumsi mimeType image adalah image/jpeg
        const imageMimeType = 'image/jpeg'; 

        await conn.reply(m.chat, '🔄 *Memulai proses Musicscope...* Ini mungkin butuh sekitar 1-2 menit. ⏱️', fkontak);
        const ms = new MusicScope();
        const videoUrl = await ms.process({ title, artist, audio: audioBuffer, audioMimeType: mime, image: imageBuffer, imageMimeType: imageMimeType });
        
        if (!videoUrl) throw new Error('Aduh, gagal mendapatkan video dari Musicscope :(');
        
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎶 *Musicscope Generated*\n\n📌 Judul: ${title}\n👤 Artis: ${artist}\n\nDiproses oleh: ${global.botname || 'Arona AI'}`
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } catch (e) {
        console.error('Error di plugin Musicscope (Class-based):', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        conn.reply(m.chat, `❌ Gagal memproses Musicscope: ${e.message}. Pastikan URL gambar langsung dan API tidak sibuk.`, fkontak);
    }
};

handler.help = ['musicscope2 <judul>|<artis>|<url_gambar>'];
handler.tags = ['ai', 'tools', 'internet'];
handler.command = ['musicscope2']; // Command utama
handler.limit = true;
handler.premium = false;

module.exports = handler;