/*Plugins CJS
Nekos [Anime Image]
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
async function fetchNekos(type = 'neko') {
  const endpoint = `https://nekos.life/api/v2/img/${type}`;
  try {
    const { data } = await axios.get(endpoint, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!data || !data.url) {
        throw new Error('Tidak ada URL gambar yang ditemukan dari API.');
    }
    return data.url;
  } catch (error) {
    console.error(`Error fetching Nekos type '${type}':`, error.message);
    if (error.response && error.response.data) {
        console.error('Nekos.life API Response:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal ambil gambar nekos.life jenis '${type}': ${error.message}`);
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    const availableTypes = ['neko', 'wallpaper', 'meow', 'cuddle', 'hug', 'kiss', 'pat', 'slap', 'smug', 'tickle', 'waifu'];
    let imageType = 'neko';
    if (text) {
        if (availableTypes.includes(text.toLowerCase())) {
            imageType = text.toLowerCase();
        } else {
            return conn.reply(m.chat, `Jenis gambar *${text}* tidak tersedia.\n\n*Jenis yang tersedia:*\n${availableTypes.join(', ')}\n\nContoh: *${usedPrefix + command} hug*`, fkontak);
        }
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const imageUrl = await fetchNekos(imageType);

        if (!imageUrl || imageUrl.trim().length === 0) {
            throw new Error('Tidak ada URL gambar yang berhasil diambil.');
        }
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: `📸 *Random Anime Image (${imageType.toUpperCase()})*\n\n_Sumber: nekos.life_`,
        }, { quoted: fkontak });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Nekos.Life:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil gambar: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['nekos <type>'];
handler.tags = ['anime', 'image'];
handler.command = /^(nekos|nekoslife)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;