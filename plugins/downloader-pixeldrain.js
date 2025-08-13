/*
- Plugins Pixeldrain Downloader
- Source: https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
- Source Scrape: https://whatsapp.com/channel/0029Vb2WECv9xVJaXVi46y2m/376
*/
const axios = require('axios');
const cheerio = require('cheerio');

const handler = async (m, { conn, text }) => {
  if (!text.includes('pixeldrain.com/u/')) {
    return m.reply('• *Example:* .pixeldrain https://pixeldrain.com/u/xxxxx');
  }

  try {
    const res = await pixeldrainDl(text);
    if (!res?.url) return m.reply('Gagal mengambil video.');

    await m.reply(`📁 *Title:* ${res.title}\n🔗 *Link:* ${res.url}\n\n_Sending video..._`);
    await conn.sendMessage(m.chat, { video: { url: res.url }, caption: res.title }, { quoted: m });
  } catch (err) {
    console.error(err);
    m.reply('Terjadi kesalahan.');
  }
};

handler.help = ['pixeldrain'].map(v => v + ' *<url>*');
handler.tags = ['downloader'];
handler.command = /^(pixeldrain)$/i;
handler.register = true;
handler.limit = true

module.exports = handler;

async function pixeldrainDl(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  return {
    title: $('meta[property="og:title"]').attr('content'),
    url: $('meta[property="og:video"]').attr('content')
  };
}