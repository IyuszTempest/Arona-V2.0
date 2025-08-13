const axios = require("axios");

let handler = async (m, { text, command, usedPrefix }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} halo`;

  try {
    const res = await axios.get(`https://api.ziapanelku.my.id/ai/luminai?text=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data || !data.status || !data.result) throw '❌ Gagal mendapatkan respons dari LuminAI.';

    m.reply(data.result);
  } catch (err) {
    console.error('luminai.js error:', err);
    m.reply('❌ Terjadi kesalahan saat menghubungi LuminAI.');
  }
};

handler.help = ['luminai <teks>'];
handler.tags = ['ai'];
handler.command = /^luminai$/i;
handler.limit = true;

module.exports = handler;