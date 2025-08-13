/*
Dibantu convert oleh Gemini
ch: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
Sumber Scrape
https://whatsapp.com/channel/0029Vb2WECv9xVJaXVi46y2m/157
*/

const axios = require('axios');
const cheerio = require('cheerio');

let handler = async (m, { conn, text, args, command }) => {
  let cmd = args[0]?.toLowerCase();

  if (!cmd) return m.reply(`*Gunakan Salah Satu Command Ini *

1 *.dafont search [nama_font]*
   Untuk mencari font berdasarkan nama.

2 *.dafont dl [link_download]*
   Untuk mengunduh font dari link hasil pencarian.

*Example :*
.dafont search fancy
.dafont dl https://dl.dafont.com/dl/?f=fancy_nancy_2`);

  switch (cmd) {
    case 'search':
      if (!args[1]) return m.reply('Mau Cari Apa Di Dafont?');
      await handleSearch(conn, m, args.slice(1).join(' '));
      break;

    case 'dl':
      if (!args[1]) return m.reply('Mana Link Nya?');
      await handleDownload(conn, m, args[1]);
      break;

    default:
      m.reply(`*Subcommand Yang Tersedia :*\n\n.dafont search\n.dafont dl`);
  }
};

async function handleSearch(conn, m, query) {
  m.reply('Searching fonts...');

  try {
    let result = await dafont(query);

    if (result.length === 0) {
      return m.reply(`Font dengan nama "${query}" tidak ditemukan!`);
    }

    let teks = `*『 DAFONT SEARCH 』*`;

    for (let i = 0; i < result.length; i++) {
      const font = result[i];
      teks += `\n\n*${i + 1}. ${font.name}*\n`;
      teks += `┌─────────────────\n`;
      teks += `├ *✍️ Creator :* ${font.creator}\n`;
      teks += `├ *✨ Total Download :* ${font.total_down}\n`;
      teks += `├ *🔗 Link Download :* ${font.link}\n`;
      teks += `└─────────────────\n\n`;
    }

    teks += `Untuk mengunduh font, gunakan perintah:\n*.dafont dl [link_download]*`;

    m.reply(teks);
  } catch (error) {
    console.error(error);
    m.reply('Error Coba Nanti Lagi');
  }
}

async function handleDownload(conn, m, url) {
  if (!url.startsWith('https://dl.dafont.com/')) {
    return m.reply('Link Nya Yang Valid Donk');
  }

  try {
    m.reply('Downloading font...');

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    const fontName = url.split('=').pop();
    const fileName = `${fontName}.zip`;

    await conn.sendMessage(m.chat, {
      document: response.data,
      mimetype: 'application/zip',
      fileName: fileName
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply('Error Coba Lagi Nanti');
  }
}

async function dafont(query) {
  try {
    const html = await axios.get('https://www.dafont.com/search.php?q=' + query);
    const $ = cheerio.load(html.data);
    const result = [];

    $('.lv1left.dfbg').each((i, el) => {
      let elem = $(el).text();
      let name = elem.split('by')[0].trim();
      let creator = elem.split('by')[1].trim();
      let total_down = $(el).next().next().find('.light').text().trim();
      let link = $(el).next().next().next().find('a.dl').attr('href');
      if (link) {
        result.push({
          name,
          creator,
          total_down,
          link: 'https:' + link
        });
      }
    });

    return result;
  } catch (err) {
    throw err;
  }
}

handler.help = ['dafont'];
handler.tags = ['downloader'];
handler.command = /^dafont$/i;

module.exports = handler;
