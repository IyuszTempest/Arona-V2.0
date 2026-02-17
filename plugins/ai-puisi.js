const axios = require('axios'); // Menggunakan require untuk CommonJS

const type = [
  'Haiku', 'Sonnet', 'Free Verse', 'Blank Verse',
  'Limerick', 'Romantic', 'Proposal', 'Love',
  'Lyric', 'Acrostic', 'Ballad', 'Epic',
  'Elegy', 'Ode', 'Pantoum', 'Narrative',
  'Cinquain', 'Villanelle', 'Sestina', 'Couplet'
];

const bahasa = ['English', 'Japanese', 'Indonesian'];

const lengths = ['short', 'medium', 'long'];

async function puisi({
  topic = 'cinta',
  length = 'long',
  type: poemType = 'Sonnet', // Ganti nama variabel 'type' agar tidak konflik dengan keyword
  lang = 'Indonesian'
} = {}) {
  try {
    if (!lengths.includes(length)) {
      throw `Panjang puisi ga ada. Gunakan salah satu dari: ${lengths.join(', ')}`;
    }
    if (!type.includes(poemType)) { // Gunakan poemType yang sudah diganti namanya
      throw `Tipe puisi ga ada. Gunakan salah satu dari: ${type.join(', ')}`;
    }
    if (!bahasa.includes(lang)) {
      throw `Bahasa ga ada. Gunakan salah satu dari: ${bahasa.join(', ')}`;
    }

    const url = 'https://aipoemgenerator.io';

    const getRes = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const tokenMatch = getRes.data.match(/<meta name="_token" content="(.*?)"/);
    if (!tokenMatch) throw 'token ga ada.';

    const token = tokenMatch[1];
    const cookies = getRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');

    const form = new URLSearchParams();
    form.append('topic', topic);
    form.append('length', length);
    form.append('type', poemType); // Gunakan poemType
    form.append('lang', lang);
    form.append('poemVersion', '1');
    form.append('_token', token);

    const postRes = await axios.post(`${url}/generate_poem`, form.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Referer': `${url}/`,
        'Origin': url,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return {
      status: true,
      result: postRes.data?.trim()
    };

  } catch (e) {
    return {
      status: false,
      message: 'ga ada respon',
      error: e?.message || e
    };
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
        let exampleText = `Gunakan format: ${usedPrefix + command} <topik>|<panjang>|<tipe>|<bahasa>\n\n` +
                          `*Topik:* Tema puisi (contoh: cinta, alam).\n` +
                          `*Panjang (opsional):* ${lengths.join(', ')} (default: long).\n` +
                          `*Tipe (opsional):* ${type.join(', ')} (default: Sonnet).\n` +
                          `*Bahasa (opsional):* ${bahasa.join(', ')} (default: Indonesian).\n\n` +
                          `*Contoh:* \n` +
                          `  ${usedPrefix + command} hujan|medium|Haiku|Indonesian\n` +
                          `  ${usedPrefix + command} persahabatan|short`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const topic = args[0];
    const length = args[1] || 'long';
    const poemType = args[2] || 'Sonnet'; // Pastikan pakai nama variabel yang sudah diganti
    const lang = args[3] || 'Indonesian';

    if (!topic) {
        return conn.reply(m.chat, "Topik puisi tidak boleh kosong, masbro!", fkontak);
    }

    if (!lengths.includes(length)) {
        return conn.reply(m.chat, `Panjang puisi tidak didukung. Gunakan salah satu: ${lengths.join(', ')}`, fkontak);
    }
    if (!type.includes(poemType)) { // Validasi pakai nama variabel yang sudah diganti
        return conn.reply(m.chat, `Tipe puisi tidak didukung. Pilih salah satu: ${type.join(', ')}`, fkontak);
    }
    if (!bahasa.includes(lang)) {
        return conn.reply(m.chat, `Bahasa tidak didukung. Pilih salah satu: ${bahasa.join(', ')}`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const result = await puisi({ topic, length, type: poemType, lang }); // Panggil puisi dengan nama variabel yang benar

        if (result.status && result.result) {
            await conn.reply(m.chat, `✨ *Puisi AI* ✨\n\n${result.result}`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } else {
            await conn.reply(m.chat, `Gagal membuat puisi: ${result.message}\n${result.error ? `Detail: ${result.error}` : ''}`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } catch (e) {
        console.error('Error in AI Poem Generator:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['puisiai <topik>|<panjang>|<tipe>|<bahasa>'];
handler.tags = ['ai'];
handler.command = /^(puisiai)$/i;
handler.limit = true; // Tambahkan jika perlu limitasi
handler.premium = false; // Ganti jadi true jika command premium

module.exports = handler;
