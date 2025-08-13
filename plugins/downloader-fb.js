/*
- Plugins Facebook DL
- Source: https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
- Source Scrape: https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/365
*/
// const axios = require('axios');
// const qs = require('qs');
// const cheerio = require('cheerio'):
const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan URL video Facebook!\n\nEX:\n${usedPrefix + command} https://www.facebook.com/reel/xxxxxx`;

  await conn.sendMessage(m.chat, { react: { text: '🌾', key: m.key } });

  try {
    const tokenRes = await userVerify(text);
    const htmlRes = await ajaxSearch(text, tokenRes.k_token, tokenRes.k_exp, tokenRes.token);
    const $ = cheerio.load(htmlRes.data);

    const title = $('.detail h3').text().trim() || 'Facebook Video';
    const duration = $('.detail p').first().text().trim() || '';
    const thumb = $('.detail .thumbnail img').attr('src') || '';
    const downloads = [];

    $('table.table tbody tr').each((_, el) => {
      const quality = $(el).find('.video-quality').text().trim();
      const url = $(el).find('a.download-link-fb').attr('href');
      if (quality && url) downloads.push({ quality, url });
    });

    if (!downloads.length) throw 'Gagal mendapatkan link video.';

    const caption = `> Request By ${m.pushName}`;

    await conn.sendMessage(m.chat, {
      video: { url: downloads[0].url },
      caption
    }, { quoted: m });

  } catch (e) {
    throw 'Gagal mengambil video. Pastikan URL benar dan publik.';
  }
};

handler.help = ['fbdl'].map(a => a + " <url>");
handler.tags = ['downloader'];
handler.command = /^(fb|fbdl|facebook)$/i;
handler.limit = true;
handler.register = true;

module.exports = handler;
//module.exports = handler;

async function userVerify(url) {
  const data = qs.stringify({ url });
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
    'Referer': 'https://fdownloader.net/id'
  };
  const res = await axios.post('https://fdownloader.net/api/userverify', data, { headers });
  return res.data;
}

async function ajaxSearch(query, token, exp, cftoken) {
  const data = qs.stringify({
    k_exp: exp,
    k_token: token,
    q: query,
    lang: 'id',
    web: 'fdownloader.net',
    v: 'v2',
    w: '',
    cftoken
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)',
    'Referer': 'https://fdownloader.net/id'
  };

  const res = await axios.post('https://v3.fdownloader.net/api/ajaxSearch', data, { headers });
  return res.data;
}