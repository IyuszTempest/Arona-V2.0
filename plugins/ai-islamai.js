const axios = require('axios'); // Menggunakan require untuk CommonJS

async function tanyaIslam(text) {
  try {
    const response = await axios.post(
      'https://vercel-server-psi-ten.vercel.app/chat',
      {
        text,
        array: [ // Array ini terlihat redundant, tapi saya ikuti struktur dari Anda
          {
            content: "What is Islam? Tell with reference to a Quran Ayat and explanation.",
            text: text
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'origin': 'https://islamandai.com',
          'referer': 'https://islamandai.com',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      }
    );

    if (!response.data || !response.data.result) {
        throw new Error('Tidak ada respons yang valid dari Islamic AI.');
    }
    return response.data.result; // Mengembalikan bagian 'result' saja
  } catch (err) {
    console.error('Error in tanyaIslam:', err.message);
    if (err.response && err.response.data) {
        console.error('Islamic AI Response Error:', JSON.stringify(err.response.data));
    }
    throw new Error(`Gagal berkomunikasi dengan Islamic AI: ${err.message}`);
  }
}

// --- Handler Plugin Bot ---
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

    if (!text) {
        return conn.reply(m.chat, `Mau tanya apa tentang Islam, masbro? Contoh: *${usedPrefix + command}* apa hukumnya menikah dengan anime?`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const islamicResponse = await tanyaIslam(text);

        if (!islamicResponse || islamicResponse.trim().length === 0) {
            throw new Error('Tidak ada jawaban yang diterima dari Islamic AI.');
        }

        await conn.reply(m.chat, `🕌 *Islamic AI Menjawab:*\n\n${islamicResponse}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

    } catch (e) {
        console.error('Error di plugin Islamic AI:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat bertanya ke Islamic AI: ${e.message}. Coba lagi nanti ya.`, fkontak);
    }
};

handler.help = ['islamai <pertanyaan>'];
handler.tags = ['ai', 'islam']; // Kategori AI atau Islam
handler.command = /^(islamai|tanyaislam)$/i; // Tambah alias command
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;