const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) throw '✨ Masukkan nama VTuber yang ingin dicari!';

  await conn.reply(m.chat, 'Mencari Informasi VTuber...', m);

  try {
    // Construct the API URL
    const apiUrl = `https://fastrestapis.fasturl.cloud/character/vtuber?name=${encodeURIComponent(text.trim())}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw `❌ Gagal mengambil data dari API! Status: ${response.status}`;

    const result = await response.json();
    
    // Check if the result is successful
    if (result.status !== 200 || !result.result) {
      throw '❌ Tidak ada data yang ditemukan untuk VTuber ini.';
    }

    const vtuber = result.result;

    // Construct the message
    let message = `*Judul:* ${vtuber.title || 'Tidak ada judul'}\n` +
                  `*URL:* ${vtuber.url || 'Tidak ada URL'}\n` +
                  `*Author:* ${vtuber.author || 'Tidak ada penulis'}\n` +
                  `*Akun:* ${vtuber.account || 'Tidak ada akun'}\n` +
                  `*Tanggal:* ${vtuber.date || 'Tidak ada tanggal'}\n` +
                  `*Tipe:* ${vtuber.type || 'Tidak ada tipe'}\n` +
                  `*Channel:* ${vtuber.channel || 'Tidak ada channel'}\n` +
                  `*Media Sosial:* ${vtuber.social_media || 'Tidak ada media sosial'}\n` +
                  `*Website Resmi:* ${vtuber.official_website || 'Tidak ada website resmi'}\n` +
                  `*Gender:* ${vtuber.gender || 'Tidak ada gender'}\n` +
                  `*Usia:* ${vtuber.age || 'Tidak ada usia'}\n` +
                  `*Deskripsi:* ${vtuber.description || 'Tidak ada deskripsi'}\n` +
                  `*More Info:* ${vtuber.more || 'Tidak ada informasi lebih lanjut'}`;

    // Send the message
    await conn.sendMessage(m.chat, { text: message, caption: 'Informasi VTuber' }, { quoted: m });

    // Optionally send the image if available
    if (vtuber.image_url) {
      await conn.sendMessage(m.chat, { image: { url: vtuber.image_url }, caption: 'Gambar VTuber' }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message || 'Gagal mengambil data.'}` }, { quoted: m });
  }
};

// Command and help information
handler.help = ['vtuber <name>'];
handler.tags = ['anime'];
handler.command = /^(vtuber)$/i;

handler.register = true;

module.exports = handler;