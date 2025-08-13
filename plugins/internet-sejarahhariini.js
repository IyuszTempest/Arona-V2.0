const axios = require('axios'); // Menggunakan require untuk CommonJS

/**
 * Ambil peristiwa sejarah yang terjadi pada hari ini
 * @returns {Promise<string>}
 */
async function todayInHistory() { // Ganti nama fungsi menjadi lebih deskriptif
  try {
    const { data } = await axios.get('https://history.muffinlabs.com/date', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!data || !data.data || !data.data.Events || data.data.Events.length === 0) {
        throw new Error('Tidak ada peristiwa sejarah ditemukan untuk hari ini.');
    }
    const event = data.data.Events[Math.floor(Math.random() * data.data.Events.length)];
    return `📜 *${event.year}* — ${event.text}`;
  } catch (error) {
    console.error('Error fetching Today in History:', error.message);
    throw new Error(`Gagal ambil sejarah hari ini: ${error.message}`);
  }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, usedPrefix, command }) => { // Tambahkan usedPrefix
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

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const historyText = await todayInHistory();

        if (!historyText || historyText.trim().length === 0) {
            throw new Error('Tidak ada sejarah yang berhasil diambil.');
        }

        await conn.reply(m.chat, `*SEJARAH HARI INI*\n\n${historyText}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Sejarah Hari Ini:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil sejarah hari ini: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['sejarahhariini'];
handler.tags = ['info', 'internet'];
handler.command = /^(sejarahhariini|historytoday)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;