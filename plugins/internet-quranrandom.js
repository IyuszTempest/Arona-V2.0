/*Plugins CJS
Quran random
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
async function getRandomQuranVerse() {
  try {
    const { data: surahListRes } = await axios.get('https://api.quran.gading.dev/surah', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!surahListRes || !surahListRes.data || surahListRes.data.length === 0) {
        throw new Error('Gagal mendapatkan daftar surah.');
    }
    const randomSurah = surahListRes.data[Math.floor(Math.random() * surahListRes.data.length)];
    const { data: surahDetailRes } = await axios.get(`https://api.quran.gading.dev/surah/${randomSurah.number}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!surahDetailRes || !surahDetailRes.data || !surahDetailRes.data.verses || surahDetailRes.data.verses.length === 0) {
        throw new Error(`Gagal mendapatkan ayat dari Surah ${randomSurah.name.transliteration.id}.`);
    }
    const ayat = surahDetailRes.data.verses[Math.floor(Math.random() * surahDetailRes.data.verses.length)];
    return `📖 QS. ${randomSurah.name.transliteration.id} ayat ${ayat.number.inSurah}\n"${ayat.text.arab}"\n\n📝 ${ayat.translation.id}`;
  } catch (error) {
    console.error('Error fetching random Quran verse:', error.message);
    if (error.response && error.response.data) {
        console.error('Quran API Response:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal ambil ayat Al-Quran: ${error.message}`);
  }
}
let handler = async (m, { conn, usedPrefix, command }) => {
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
        const quranVerse = await getRandomQuranVerse();
        if (!quranVerse || quranVerse.trim().length === 0) {
            throw new Error('Tidak ada ayat Al-Quran yang berhasil diambil.');
        }
        await conn.reply(m.chat, quranVerse, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Random Ayat Quran:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil ayat Al-Quran: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['quranrandom'];
handler.tags = ['islam', 'info'];
handler.command = /^(quranrandom|ayatrandom|randomquran)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;