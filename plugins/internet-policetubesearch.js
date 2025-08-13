/*

Plugins : PoliceTube search
Note : sebenarnya tadi bikin downloader nya juga, tapi request failed with status 404
Type : CommonJs
Code by : Chatgpt

- *Sumber* :
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
   
 */

const axios = require('axios');

async function handler(m, { args}) {
  const keyword = (args && args.length)? args.join(' '): '';
  if (!keyword) return m.reply('⚠️ Masukkan kata kunci pencarian.');

  try {
    const { data} = await axios.get(`https://api.policetube.co/search/home-related?keyword=${encodeURIComponent(keyword)}&limit=10`);
    const results = data?.result?.vipe;

    if (!Array.isArray(results) || results.length === 0) {
      return m.reply('❌ Tidak ada hasil ditemukan.');
}

    const message = results.map((v, i) => (
      `🔹 *${i + 1}. ${v.title}*\n` +
      `👁️ ${v.views} views\n` +
      `🔗 https://www.policetube.co/video/${v.video_id}`
)).join('\n\n');

    m.reply(`🔍 *Hasil pencarian untuk:* _${keyword}_\n\n${message}`);
} catch (err) {
    console.error(err);
    m.reply(`❌ Gagal mencari: ${err.message}`);
}
}

handler.command = ['policetubesearch', 'pts'];
handler.help = ['policetubesearch'];
handler.tags = ['internet', 'tools'];

module.exports = handler;