const axios = require('axios');
const FormData = require('form-data'); // Menggunakan require untuk CommonJS
const { proto } = require("@adiwajshing/baileys"); // Untuk prepareWAMessageMedia jika perlu

const api_url = 'https://ziqiangao-musicscopegen.hf.space/gradio_api';
const file_url = 'https://ziqiangao-musicscopegen.hf.space/gradio_api/file=';

const generateSession = () => Math.random().toString(36).substring(2);

const uploadFile = async (buffer, filename, mimeType) => { // Tambah mimeType
  const upload_id = generateSession();
  const form = new FormData();
  form.append('files', buffer, { filename, contentType: mimeType }); // Tambah contentType

  try {
    const res = await axios.post(`${api_url}/upload?upload_id=${upload_id}`, form, { // Gunakan axios
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': api_url
      }
    });
    const json = res.data;
    if (!json || !json[0]) throw new Error('Upload gagal atau respons tidak valid dari server.');
    
    return {
      orig_name: filename,
      path: json[0],
      url: `${file_url}${json[0]}`
    };
  } catch (error) {
    console.error('Error uploading file to HF Space:', error.message);
    if (error.response && error.response.data) {
      console.error('HF Space Upload API Response:', error.response.data.toString());
    }
    throw new Error(`Gagal upload file ke server: ${error.message}`);
  }
};

let handler = async (m, { conn, text, usedPrefix, command }) => { // Tambahkan usedPrefix, command
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
        return conn.reply(m.chat, `Format salah. Contoh: *${usedPrefix + command}* Judul|Artis|URL_Gambar (balas audio)`, fkontak);
    }
    if (!imgUrl.startsWith('http')) {
        return conn.reply(m.chat, 'URL Gambar tidak valid. Harus dimulai dengan http(s)://', fkontak);
    }

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/^audio/.test(mime)) return conn.reply(m.chat, 'Balas dengan audio MP3-nya ya, masbro.', fkontak);

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const audioBuffer = await q.download();
        if (!audioBuffer || audioBuffer.length === 0) throw new Error('Gagal mengunduh audio.');
        
        await conn.reply(m.chat, '⏳ *Mengunduh dan mengunggah gambar...*', fkontak);
        const imageBuffer = await (await axios.get(imgUrl, { responseType: 'arraybuffer' })).data;
        if (!imageBuffer || imageBuffer.length === 0) throw new Error('Gagal mengunduh gambar.');

        await conn.reply(m.chat, '🔄 *Memulai proses Musicscope...* Ini mungkin butuh beberapa waktu. ⏱️', fkontak);
        const audioFile = await uploadFile(audioBuffer, `audio_${Date.now()}.mp3`, mime); // Gunakan mime dari audio
        const imageFile = await uploadFile(imageBuffer, `image_${Date.now()}.jpg`, 'image/jpeg'); // Asumsi image/jpeg
        const session = generateSession();

        // Data payload untuk join queue (pastikan urutan & tipe data sesuai Gradio)
        const payload = {
            data: [
                { path: audioFile.path, url: audioFile.url, orig_name: audioFile.orig_name, size: audioBuffer.length, mime_type: 'audio/mpeg', meta: { _type: 'gradio.FileData' } },
                null, // ini mungkin untuk input video (kosong)
                'Output', // ini output format/name
                30, // durasi?
                1280, // width
                720, // height
                1024, // bitrate?
                { path: imageFile.path, url: imageFile.url, orig_name: imageFile.orig_name, size: imageBuffer.length, mime_type: 'image/jpeg', meta: { _type: 'gradio.FileData' } },
                title,
                artist
            ],
            event_data: null,
            fn_index: 0, // Ini bisa berubah kalau API-nya update
            trigger_id: 26, // Ini juga bisa berubah
            session_hash: session
        };

        // Kirim permintaan ke queue
        await axios.post(`${api_url}/queue/join`, payload, {
            headers: { 'Content-Type': 'application/json' } // Pastikan Content-Type benar
        });

        let resultVideoUrl;
        let pollingAttempts = 0;
        const maxPollingAttempts = 90; // Maksimal 90 percobaan (1.5 menit jika interval 1s)
        const pollingInterval = 1000; // Cek setiap 1 detik

        // Polling untuk mendapatkan hasil
        while (!resultVideoUrl && pollingAttempts < maxPollingAttempts) {
            const { data } = await axios.get(`${api_url}/queue/data?session_hash=${session}`);
            const lines = data.split('\n\n');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const d = JSON.parse(line.slice(6));
                    if (d.msg === 'process_completed' && d.output?.data?.[0]?.video?.url) { // Ambil URL video dari output
                        resultVideoUrl = d.output.data[0].video.url;
                        break;
                    } else if (d.msg === 'process_starts' || d.msg === 'estimation' || d.msg === 'send_data') {
                        // Proses masih berjalan atau informasi estimasi
                    } else if (d.msg === 'queue_full' || d.msg === 'process_failed') {
                         throw new Error(`HF Space Status: ${d.msg}. Gagal memproses Musicscope.`);
                    }
                }
            }
            if (!resultVideoUrl) {
                pollingAttempts++;
                await new Promise(resolve => setTimeout(resolve, pollingInterval));
            }
        }

        if (!resultVideoUrl) throw new Error('Timeout: Gagal mendapatkan video Musicscope.');

        await conn.sendMessage(m.chat, {
            video: { url: resultVideoUrl },
            caption: `🎶 *Musicscope Generated*\n\n📌 Judul: ${title}\n👤 Artis: ${artist}\n\nDiproses oleh: ${global.botname || 'Arona AI'}`
        }, { quoted: fkontak }); // Pakai fkontak
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } catch (e) {
        console.error('Error di plugin Musicscope:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        conn.reply(m.chat, `❌ Gagal memproses Musicscope: ${e.message}. Pastikan URL gambar langsung dan API tidak sibuk.`, fkontak);
    }
};

handler.help = ['musicscope <judul>|<artis>|<url_gambar>'];
handler.tags = ['ai', 'tools','internet']; // Tambah tag audio/video
handler.command = ['musicscope'];
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;