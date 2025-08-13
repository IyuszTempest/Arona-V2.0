/*
- Plugins Nekopoi
- Source: https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
- Source Scrape: https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/377
*/
// const axios = require('axios');
// const cheerio = require('cheerio'):
const axios = require('axios');
const cheerio = require('cheerio');

let handler = async (m, { conn, args, command }) => {
  try {
    if (!args[0]) {
      const helpMessage = `
Gunakan salah satu perintah berikut:
- *${command} search <judul>* untuk mencari konten di Nekopoi.
- *${command} detail <url>* untuk melihat detail konten.

Contoh penggunaan:
1. *${command} search overflow* untuk mencari konten dengan kata kunci "overflow".
2. *${command} detail https://nekopoi.care/xxxx* untuk melihat detail konten.
      `;
      await conn.sendMessage(m.chat, { text: helpMessage }, { quoted: m });
      return;
    }

    const type = args[0].toLowerCase();

    switch (type) {
      case 'search':
        if (!args[1]) throw 'Masukkan kata kunci untuk pencarian.';
        const query = args.slice(1).join(' ');
        const searchResults = await nekopoiSearch(query);
        if (searchResults.length === 0) throw 'Tidak ada hasil ditemukan untuk kata kunci tersebut.';
        let searchText = `Hasil pencarian untuk "${query}":\n\n`;
        searchText += searchResults.map((item, index) => 
          `${index + 1}. *${item.title}*\n` +
          `   URL: ${item.url}\n` +
          `   Thumbnail: ${item.thumbnail || 'Tidak ada thumbnail'}\n` +
          `   Langkah berikutnya: !${command} detail ${item.url}`
        ).join('\n\n');
        await conn.sendMessage(m.chat, {
          text: searchText,
          contextInfo: {
            externalAdReply: {
              title: 'Pencarian Nekopoi',
              body: `Hasil untuk "${query}"`,
              thumbnailUrl: searchResults[0]?.thumbnail || 'https://nekopoi.care/wp-content/uploads/2024/10/thm_123456.jpg',
              sourceUrl: 'https://nekopoi.care',
              mediaType: 1,
              renderLargerThumbnail: false
            },
            mentionedJid: [],
            forwardingScore: 0,
            isForwarded: false
          }
        }, { quoted: m });
        break;

      case 'detail':
        if (!args[1]) throw 'Masukkan URL detail konten.';
        const detailResult = await nekopoiDetail(args[1]);
        let detailText = `*${detailResult.title}*\n\n` +
          `• Parody: ${detailResult.parody || 'N/A'}\n` +
          `• Producer: ${detailResult.producer || 'N/A'}\n` +
          `• Durasi: ${detailResult.duration || 'N/A'}\n` +
          `• Dilihat: ${detailResult.views} kali\n` +
          `• Tanggal: ${detailResult.date}\n` +
          `• Thumbnail: ${detailResult.thumbnail || 'Tidak ada thumbnail'}\n\n` +
          `• Ukuran File:\n${Object.entries(detailResult.sizes).map(([res, size]) => `  ${res}: ${size}`).join('\n') || 'Tidak ada informasi ukuran'}\n\n` +
          `• Link Streaming:\n${detailResult.streams.map(stream => `  ${stream.name}: ${stream.url}`).join('\n') || 'Tidak ada link streaming'}\n\n` +
          `• Link Download:\n${Object.entries(detailResult.downloads).map(([res, links]) => 
            `  ${res}:\n` +
            `    Normal:\n${links.normal.map(link => `      ${link.name}: ${link.url}`).join('\n') || '      Tidak ada'}\n` +
            `    Ouo:\n${links.ouo.map(link => `      ${link.name}: ${link.url}`).join('\n') || '      Tidak ada'}`
          ).join('\n\n') || 'Tidak ada link download'}`;
        await conn.sendMessage(m.chat, {
          text: detailText,
          contextInfo: {
            externalAdReply: {
              title: detailResult.title,
              body: `Detail konten`,
              thumbnailUrl: detailResult.thumbnail || 'https://nekopoi.care/wp-content/uploads/2024/10/thm_123456.jpg',
              sourceUrl: args[1],
              mediaType: 1,
              renderLargerThumbnail: false
            },
            mentionedJid: [],
            forwardingScore: 0,
            isForwarded: false
          }
        }, { quoted: m });
        break;

      default:
        throw `Perintah tidak dikenali. Gunakan: *${command} search <judul>* atau *${command} detail <url>*`;
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: `${error.message || error}` }, { quoted: m });
  }
};

handler.command = /^(nekopoi)$/i;
handler.help = ['nekopoi <search|detail> <query/url>'];
handler.tags = ['nsfw','premium'];
handler.nsfw = true;
handler.premium = true;
handler.limit = true;
handler.register = true;

module.exports = handler;
// module.exports = handler;

async function nekopoiSearch(query, page = 1) {
  const baseUrl = 'https://nekopoi.care/search/';
  const results = [];

  try {
    const url = page === 1 ? `${baseUrl}${query}` : `${baseUrl}${query}/page/${page}/?${query}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const items = $('div.result ul li');

    if (items.length === 0) {
      throw 'Tidak ada hasil ditemukan di halaman ini.';
    }

    items.each((index, element) => {
      const titleElement = $(element).find('h2 a');
      const title = titleElement.text().trim();
      const url = titleElement.attr('href');
      const thumbnail = $(element).find('img').attr('src');

      if (title && url) {
        results.push({ title, url, thumbnail });
      }
    });

    return results;
  } catch (error) {
    throw `Gagal melakukan pencarian: ${error.message || error}`;
  }
}

async function nekopoiDetail(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const result = {
      title: '',
      parody: '',
      producer: '',
      duration: '',
      views: '',
      date: '',
      thumbnail: '',
      sizes: {},
      streams: [],
      downloads: {}
    };

    result.title = $('div.eroinfo h1').text().trim();
    result.thumbnail = $('div.thm img').attr('src');

    $('div.konten p').each((index, element) => {
      const text = $(element).text().trim();
      if (text.startsWith('Parody')) {
        result.parody = text.replace('Parody : ', '').trim();
      } else if (text.startsWith('Producers')) {
        result.producer = text.replace('Producers : ', '').trim();
      } else if (text.startsWith('Duration')) {
        result.duration = text.replace('Duration : ', '').trim();
      } else if (text.includes('Size')) {
        const sizeMatches = text.match(/(\d+P)\s*:\s*(\d+mb)/g);
        if (sizeMatches) {
          sizeMatches.forEach(match => {
            const [resolution, size] = match.split(' : ');
            result.sizes[resolution.trim()] = size.trim();
          });
        }
      }
    });

    const viewsDateText = $('div.eroinfo p').text().trim();
    const viewsMatch = viewsDateText.match(/Dilihat\s+(\d+)\s+kali/);
    const dateMatch = viewsDateText.match(/\/\s+(.+)/);
    result.views = viewsMatch ? viewsMatch[1] : 'N/A';
    result.date = dateMatch ? dateMatch[1].trim() : 'N/A';

    $('div#show-stream div.openstream iframe').each((index, element) => {
      const src = $(element).attr('src');
      if (src) {
        result.streams.push({
          name: `Stream ${index + 1}`,
          url: src
        });
      }
    });

    $('div.boxdownload div.liner').each((index, element) => {
      const resolution = $(element).find('div.name').text().match(/\[(\d+p)\]/)?.[1];
      if (resolution) {
        const links = { normal: [], ouo: [] };
        $(element).find('div.listlink p a').each((i, linkElement) => {
          const href = $(linkElement).attr('href');
          const text = $(linkElement).text().trim();
          if (href.includes('ouo.io')) {
            links.ouo.push({ name: text.replace('[ouo]', ''), url: href });
          } else {
            links.normal.push({ name: text, url: href });
          }
        });
        result.downloads[resolution] = links;
      }
    });

    if (!result.title) {
      throw 'Data detail tidak ditemukan.';
    }

    return result;
  } catch (error) {
    throw `Gagal mengambil detail: ${error.message || error}`;
  }
}