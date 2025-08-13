/*

Plugins : mediafire search
Type : CommonJs
Code by : Chatgpt

- *Sumber* :
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
   
 */

const axios = require('axios');
const cheerio = require('cheerio');

function shuffle(arr) {
  for (let i = arr.length - 1; i> 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
}
  return arr;
}

async function mfsearch(query) {
  if (!query) throw new Error('Query is required');

  const { data: html} = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`);
  const $ = cheerio.load(html);

  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
).slice(0, 5);

  const result = await Promise.all(links.map(async link => {
    const { data} = await axios.get(`https://mediafiretrend.com${link}`);
    const $ = cheerio.load(data);

    const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text();
    const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/);
    const decoded = cheerio.load(decodeURIComponent(match[1]));

    return {
      filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
      filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
      url: decoded('a').attr('href'),
      source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
      source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
};
}));

  return result;
}

const handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) return m.reply(`🔍 Contoh penggunaan:\n${usedPrefix + command} <query>\n\nContoh:\n${usedPrefix + command} Naruto OST`);

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key}});

    const results = await mfsearch(text);
    if (!results ||!results.length) return m.reply('❌ Tidak ditemukan hasil untuk query tersebut.');

    let msg = `📁 Hasil pencarian untuk: *${text}*\n\n`;
    for (let i = 0; i < results.length; i++) {
      let r = results[i];
      msg += `📝 *${r.filename}* (${r.filesize})\n🔗 [Download](${r.url})\n🌐 Source: ${r.source_title}\n\n`;
}

    await m.reply(msg.trim());
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key}});
} catch (err) {
    await m.reply(`❌ Terjadi kesalahan:\n${err.message}`);
}
};

handler.help = ['mediafiresearch <query>'];
handler.tags = ['internet', 'search'];
handler.command = /^mediafiresearch|mfsearch$/i;
module.exports = handler;