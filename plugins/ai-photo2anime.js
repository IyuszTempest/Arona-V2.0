const axios = require('axios');
const fetch = require('node-fetch'); // Tetap pakai node-fetch untuk fetch URL
const FormData = require('form-data');
const { Readable } = require('stream'); // Untuk membuat stream dari buffer
const cheerio = require('cheerio'); // Tambahkan cheerio jika ada parsing HTML

function randomIP() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
}

function randomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Android 12; Mobile; rv:102.0) Gecko/102.0 Firefox/102.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Session-wide IP and UA for consistent requests
const sessionIP = randomIP();
const sessionUA = randomUserAgent();

function getBaseHeaders() {
  // x-code dan x-guide kemungkinan dinamis dan bisa berubah!
  // Jika bot gagal, cek apakah header ini masih valid dari situs aslinya.
  return {
    'fp': 'c74f54010942b009eaa50cd58a1f4419',
    'fp1': '3LXezMA2LSO2kESzl2EYNEQBUWOCDQ/oQMQaeP5kWWHbtCWoiTptGi2EUCOLjkdD',
    'origin': 'https://pixnova.ai',
    'referer': 'https://pixnova.ai/',
    'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    'x-code': '1752930995556', // SANGAT RENTAN BERUBAH
    'x-guide': 'SjwMWX+LcTqkoPt48PIOgZzt3eQ93zxCGvzs1VpdikRR9b9+HvKM0Qiceq6Zusjrv8bUEtDGZdVqjQf/bdOXBb0vEaUUDRZ29EXYW0kt047grMMceXzd3zppZoHZj9DeXZOTGaG50PpTHxTjX3gb0D1wmfjol2oh7d5jJFSIsY0=', // SANGAT RENTAN BERUBAH
    'accept-language': 'id-ID,id;q=0.9,en-US,en;q=0.8',
    'accept': 'application/json, text/plain, */*',
    'user-agent': sessionUA,
    'X-Forwarded-For': sessionIP,
    'Client-IP': sessionIP
  };
}

// Fungsi untuk upload buffer gambar langsung dari bot ke Pixnova
async function uploadFromBuffer(imageBuffer) {
  const stream = Readable.from(imageBuffer); // Buat readable stream dari buffer
  const form = new FormData();
  form.append('file', stream, { filename: 'image.jpg', contentType: 'image/jpeg' }); // Tambah filename dan contentType
  form.append('fn_name', 'demo-photo2anime');
  form.append('request_from', '2');
  form.append('origin_from', '111977c0d5def647');

  try {
    const upload = await axios.post('https://api.pixnova.ai/aitools/upload-img', form, {
      headers: {
        ...getBaseHeaders(),
        ...form.getHeaders()
      }
    });
    if (!upload.data?.data?.path) throw new Error('Upload gambar ke Pixnova gagal atau path tidak ditemukan.');
    return upload.data.data.path;
  } catch (error) {
    console.error('Error uploading to Pixnova:', error.message);
    if (error.response && error.response.data) {
      console.error('Pixnova Upload API Response:', error.response.data.toString());
    }
    throw new Error(`Gagal mengunggah gambar ke Pixnova: ${error.message}`);
  }
}

async function createTask(sourceImage) {
  const payload = {
    fn_name: 'demo-photo2anime',
    call_type: 3,
    input: {
      source_image: sourceImage,
      strength: 0.6,
      prompt: 'use anime style, hd, 8k, smooth, aesthetic',
      negative_prompt: '(worst quality, low quality:1.4), (greyscale, monochrome:1.1), cropped, lowres , username, blurry, trademark, watermark, title, multiple view, Reference sheet, curvy, plump, fat, strabismus, clothing cutout, side slit,worst hand, (ugly face:1.2), extra leg, extra arm, bad foot, text, name',
      request_from: 2
    },
    request_from: 2,
    origin_from: '111977c0d5def647'
  };

  const headers = {
    ...getBaseHeaders(),
    'content-type': 'application/json',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site'
  };

  try {
    const res = await axios.post('https://api.pixnova.ai/aitools/of/create', payload, { headers });
    if (!res.data?.data?.task_id) throw new Error('Gagal mendapatkan ID tugas dari Pixnova.');
    return res.data.data.task_id;
  } catch (error) {
    console.error('Error creating Pixnova task:', error.message);
    if (error.response && error.response.data) {
      console.error('Pixnova Create Task API Response:', error.response.data.toString());
    }
    throw new Error(`Gagal membuat tugas konversi: ${error.message}`);
  }
}

async function waitForResult(taskId) {
  const payload = {
    task_id: taskId,
    fn_name: 'demo-photo2anime',
    call_type: 3,
    request_from: 2,
    origin_from: '111977c0d5def647'
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // Local delay (jika belum ada global)

  for (let i = 1; i <= 30; i++) { // Polling maksimal 30x (60 detik)
    const headers = {
      ...getBaseHeaders(),
      'content-type': 'application/json'
    };

    try {
      const check = await axios.post('https://api.pixnova.ai/aitools/of/check-status', payload, { headers });
      const data = check.data?.data;
      if (data?.status === 2 && data?.result_image) {
        const url = data.result_image.startsWith('http')
          ? data.result_image
          : `https://oss-global.pixnova.ai/${data.result_image}`;
        return url;
      }
      if (data?.status === 3) { // Status 3 mungkin 'FAILED' atau 'ERROR'
          throw new Error('Proses konversi gagal di Pixnova AI.');
      }
    } catch (error) {
        console.error(`Error during Pixnova status check (attempt ${i}):`, error.message);
        // Jangan throw di sini, biar polling berlanjut kecuali error sangat fatal
    }
    await delay(2000); // Tunggu 2 detik antar cek status
  }

  throw new Error('Timeout: Gagal mendapatkan hasil konversi dari Pixnova.');
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, usedPrefix, command }) => {
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

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime.startsWith('image/')) {
        return conn.reply(m.chat, `Silakan kirim atau reply gambar dengan caption *${usedPrefix + command}* untuk diubah jadi anime.`, fkontak);
    }

    if (q.msg && typeof q.msg.fileLength === 'number' && q.msg.fileLength > 10 * 1024 * 1024) { // Batasi 10 MB
        return conn.reply(m.chat, 'Ukuran gambar terlalu besar! Maksimal 10 MB ya, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        let imageBuffer = await q.download(); // Download gambar ke buffer
        if (!imageBuffer || imageBuffer.length === 0) {
            throw new Error('Gagal mengunduh gambar dari pesan.');
        }

        await conn.reply(m.chat, '🔄 *Memulai proses konversi ke anime...*\n\n_Ini akan membutuhkan waktu (sekitar 1 menit), mohon bersabar ya!_ ⏱️', fkontak);
        
        const sourceImage = await uploadFromBuffer(imageBuffer); // Upload gambar ke Pixnova
        if (!sourceImage) throw new Error('Gagal mengunggah gambar ke server Pixnova.');

        const taskId = await createTask(sourceImage); // Buat task konversi
        if (!taskId) throw new Error('Gagal membuat tugas konversi di Pixnova.');

        const resultUrl = await waitForResult(taskId); // Tunggu hasilnya
        if (!resultUrl) throw new Error('Gagal mendapatkan URL gambar hasil konversi.');

        await conn.sendMessage(m.chat, {
            image: { url: resultUrl },
            caption: `✅ *Done! Gambar Anda diubah menjadi Anime!*`,
            mimetype: 'image/jpeg' // Asumsi output jpeg, bisa juga webp/png
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Photo to Anime:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat mengubah foto jadi anime: ${e.message}. Coba lagi nanti ya.`, fkontak);
    }
};

handler.help = ['f2anime'];
handler.tags = ['ai']; // Tambah tag 'anime'
handler.command = /^(f2anime)$/i; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = false; // Ini API gratis, tidak perlu premium

module.exports = handler;
