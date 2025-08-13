/**
 * @ ✨ Scrape YouTube Transcript
 * @ Author : SaaOfc's
**/

const fetch = require('node-fetch'); // Menggunakan require untuk CommonJS

async function Transcript(videoUrl) {
  try {
    // Ekstrak video ID dari URL YouTube
    let videoId;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    } else {
      throw new Error('URL YouTube tidak valid atau tidak ditemukan Video ID.');
    }

    const response = await fetch('https://kome.ai/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://kome.ai',
        'Referer': 'https://kome.ai/tools/youtube-transcript-generator',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 OPR/78.0.4093.184',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        video_id: videoId, // Gunakan videoId yang sudah diekstrak
        format: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengambil transkrip! Status: ${response.status}. Respon: ${errorText}`);
    }

    const data = await response.json();

    if (!data.transcript) {
      throw new Error('Tidak ada transkrip ditemukan untuk video ini.');
    }

    return data.transcript;
  } catch (err) {
    console.error("Error in Transcript function:", err.message);
    throw new Error(`Error: ${err.message}`); // Lemparkan error agar bisa ditangkap di handler
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
        return conn.reply(m.chat, `Kasih link video YouTube-nya dong, masbro! Contoh: *${usedPrefix + command}* https://youtu.be/oIHLgsPpSOE`, fkontak);
    }

    // Validasi sederhana untuk URL YouTube
    if (!text.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link YouTube yang valid, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const transcriptText = await Transcript(text);
        
        let message = `📝 *Transkrip YouTube*\n\n`;
        message += `${transcriptText}\n\n`;
        message += `_Sumber: kome.ai_`;

        await conn.reply(m.chat, message, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin YouTube Transcript:', e);
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil transkrip: ${e.message}. Pastikan link valid dan video memiliki transkrip.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['yttranscript <link_youtube>'];
handler.tags = ['tools']; // Kategori tools atau downloader
handler.command = /^(yttranscript|yttr)$/i;
handler.limit = true; // Bisa pakai limit

module.exports = handler;