// Plugins To Anime Using 🔥
// Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C

const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage.js');

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return conn.sendMessage(m.chat, {
      text: `Kirim atau balas gambar dengan caption *${usedPrefix + command}*`
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  });

  try {
    const buffer = await q.download();
    if (!buffer) throw 'Gagal mengunduh gambar';

    const imageUrl = await uploadImage(buffer);
    const apiUrl = `https://api.nekorinn.my.id/tools/img2anime?imageUrl=${encodeURIComponent(imageUrl)}`;

    const res = await fetch(apiUrl);
    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const json = await res.json();
      if (!json.status || !json.result) throw 'Gagal memproses gambar dari API';

      await conn.sendMessage(m.chat, {
        image: { url: json.result },
        caption: 'Nih kamu jadi animek, Sensei!'
      }, { quoted: m });
    } else {
      const resultImage = await res.buffer();
      await conn.sendMessage(m.chat, {
        image: resultImage,
        caption: 'Nih kamu jadi animek, Sensei!'
      }, { quoted: m });
    }

  } catch (e) {
    console.error('Rest api tidak merespon sensei:(', e);
    await conn.sendMessage(m.chat, {
      text: 'Terjadi kesalahan saat memproses gambar.'
    }, { quoted: m });
  }
};

handler.help = ['toanime'];
handler.tags = ['anime','premium'];
handler.command = /^toanime$/i;

handler.premium = true;

module.exports = handler;