// • Plugins Dosa Jariyah:v
// • Source: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C

const axios = require('axios');
const cheerio = require('cheerio');

async function searchHentai(query) {
  try {
    const { data } = await axios.get("https://hentai.tv/?s=" + encodeURIComponent(query));
    const $ = cheerio.load(data);
    const result = [];

    $('div.flex > div.crsl-slde').each((i, el) => {
      const thumbnail = $(el).find('img').attr('src');
      const title = $(el).find('a').text().trim();
      const views = $(el).find('p').text().trim();
      const url = $(el).find('a').attr('href');
      result.push({ thumbnail, title, views, url });
    });

    return {
      coder: 'SaaOfc',
      warning: 'failed',
      result
    };
  } catch (err) {
    return { error: 'error', message: err.message };
  }
}

const handler = async (m, { conn, args }) => {
  if (!args.length) return m.reply('Masukkan judul yang ingin dicari!\nContoh: .searchhentai hinata');

  const res = await searchHentai(args.join(" "));
  if (!res || res.result.length === 0) return m.reply('Tidak ditemukan!');

  let teks = `*Hasil Pencarian dari Hentai.tv*\n\n`;
  for (let i = 0; i < Math.min(5, res.result.length); i++) {
    const x = res.result[i];
    teks += `*${x.title}*\nViews: ${x.views}\nURL: ${x.url}\n\n`;
  }

  await conn.sendMessage(m.chat, {
    text: teks.trim(),
    contextInfo: {
      externalAdReply: {
        title: "Hentai Search",
        body: "Om jangan om",
        thumbnailUrl: res.result[0]?.thumbnail,
        sourceUrl: res.result[0]?.url,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
}

handler.help = handler.command = ['carihentai'];
handler.tags = ['nsfw','premium'];
handler.nsfw = true;
handler.limit = true;
handler.premium = true;

module.exports = handler;
