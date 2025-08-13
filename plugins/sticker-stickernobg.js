const axios = require('axios');
const FormData = require('form-data');
const fs = require("fs");

async function Uguu(buffer, filename) {
  try {
    const form = new FormData();
    form.append('files[]', buffer, { filename });
    const { data } = await axios.post('https://uguu.se/upload.php', form, { headers: form.getHeaders() });
    if (data.files && data.files[0]) {
      return { name: data.files[0].name, url: data.files[0].url, size: data.files[0].size };
    } else {
      throw new Error('Upload gagal.');
    }
  } catch (err) {
    throw `Terjadi kesalahan saat upload: ${err.message}`;
  }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime || !mime.startsWith('image/')) throw `Kirim/Balas gambar dengan command *${usedPrefix + command}*`;
    let media = await q.download();
    let ext = mime.split('/')[1];
    let filename = `upload.${ext}`;
    let result = await Uguu(media, filename);
    let { data } = await axios.get(`https://www.abella.icu/rmbg?url=${result.url}`, { responseType: 'arraybuffer' });
    let buffer = Buffer.from(data, 'binary');
    let [kiri, kanan] = text.split("|");
    await conn.sendImageAsSticker(m.chat, buffer, m, { packname: kiri || global.packname, author: kanan || global.author });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    await conn.sendMessage(m.chat, { text: `${error}` }, { quoted: m });
  }
};

handler.help = ['stickernobg'];
handler.tags = ['sticker'];
handler.command = ['stickernobg', 'snobg'];
handler.limit = true;

module.exports = handler;