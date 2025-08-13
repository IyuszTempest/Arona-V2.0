/*

Plugins : wallcraft
Note : buat cari wallpaper
Type : CommonJs
Code by : Chatgpt

- *Sumber* :
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
   
 */

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh penggunaan:\n${usedPrefix + command} anime`);
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  try {
    const query = encodeURIComponent(text);
    const url = `https://api-uc.wallpaperscraft.com/images?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&lang=en&limit=60&types%5B%5D=free&types%5B%5D=private&offset=0&query=${query}&cost_variant=android_cost_1&sort=rating&uploader_types%5B%5D=wlc&uploader_types%5B%5D=user&uploader_types%5B%5D=wlc_ai_art`;

    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'wallpaperscraft-android/3.56.0',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip',
        'X-APP-VERSION': 'Android-35600',
        'X-AppCheck-Token': ''
      }
    });

    const items = res.data.items || [];
    if (!items.length) throw 'Tidak ada hasil ditemukan.';

    const item = items[0]; // ambil hasil teratas
    const img = item.variations?.original?.url || item.variations?.adapted?.url;
    if (!img) throw 'Gambar tidak ditemukan.';

    const caption = `📌 *Deskripsi:* ${item.description || '-'}
⭐ *Rating:* ${item.rating}
⬇️ *Downloads:* ${item.downloads}
🏷️ *Tags:* ${item.tags?.join(', ') || '-'}`;

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply(`Terjadi kesalahan saat mengambil wallpaper.\n\n${err}`);
  }
};

handler.command = /^wallcraft$/i;
handler.tags = ['internet'];
handler.help = ['wallcraft <keyword>'];
handler.limit = true;

module.exports = handler;