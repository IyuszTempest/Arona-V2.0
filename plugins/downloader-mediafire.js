const axios = require('axios');

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('Masukin URL MediaFire-nya dong~');
  try {
    let { data } = await axios.get('https://fgsi1-restapi.hf.space/api/downloader/mediafire?url=' + encodeURIComponent(text));
    if (!data.status) throw 'Gagal nih ambil datanya :(';
    let { downloadUrl, filename } = data.data;
    await conn.sendMessage(m.chat, {
      document: { url: downloadUrl },
      fileName: filename,
      mimetype: 'application/zip'
    }, { quoted: m });
  } catch (e) {
    m.reply('Waduh, gagal ambil filenya nih: ' + e);
  }
};

handler.help = ['mediafire'];
handler.command = ['mediafire'];
handler.tags = ['downloader'];

module.exports = handler;