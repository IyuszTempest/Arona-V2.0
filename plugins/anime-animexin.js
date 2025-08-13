/*
- Plugins Animexin Search/Detail/Down
- Source: https://whatsapp.com/channel/0029Vb1NWzkCRs1ifTWBb13u
- Source Scrape: https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/388
*/
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const BASE_URL = 'https://animexin.dev/';
const SEARCH_PATH = '?s=';

function cleanText(text) {
  return text ? text.trim().replace(/\s+/g, ' ') : '';
}

function cleanUrl(url) {
  if (!url) return url;
  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    decoded = url;
  }
  decoded = decoded.trim().replace(/[\r\n\t]/g, '');
  try {
    return encodeURI(decoded);
  } catch {
    return decoded;
  }
}

let handler = async (m, { conn, args, command }) => {
  try {
    if (!args[0]) {
      const helpMessage = `
Gunakan salah satu perintah berikut:
- *${command} search <judul>* untuk mencari anime di AnimeXin.
- *${command} detail <url>* untuk melihat detail anime.
- *${command} download <url>* untuk melihat link download.

Contoh penggunaan:
1. *${command} search Super cube* untuk mencari anime dengan kata kunci "Super cube".
2. *${command} detail https://animexin.dev/xxxxxx* untuk detail anime.
3. *${command} download https://animexin.dev/xxxxxx* untuk link download.
      `;
      await conn.sendMessage(m.chat, { text: helpMessage }, { quoted: m });
      return;
    }

    const type = args[0].toLowerCase();

    switch (type) {
      case 'search':
        if (!args[1]) throw 'Masukkan kata kunci untuk pencarian.';
        const query = args.slice(1).join(' ');
        const searchResults = await animexinSearch(query);
        if (searchResults.length === 0) throw 'Tidak ada hasil ditemukan untuk kata kunci tersebut.';
        let searchText = `Hasil pencarian untuk "${query}":\n\n`;
        searchText += searchResults.map((item, index) => 
          `${index + 1}. *${item.title}*\n` +
          `   URL: ${item.link}\n` +
          `   Thumbnail: ${item.img || 'Tidak ada thumbnail'}\n` +
          `   Status: ${item.status || 'N/A'}\n` +
          `   Langkah berikutnya: !${command} detail ${item.link}`
        ).join('\n\n');
        await conn.sendMessage(m.chat, {
          text: searchText,
          contextInfo: {
            externalAdReply: {
              title: 'Pencarian AnimeXin',
              body: `Hasil untuk "${query}"`,
              thumbnailUrl: searchResults[0]?.img || 'https://animexin.dev/wp-content/uploads/2023/10/default.jpg',
              sourceUrl: BASE_URL,
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
        if (!args[1]) throw 'Masukkan URL detail anime.';
        const detailResult = await animexinDetail(args[1]);
        let detailText = `*${detailResult.title}*\n\n` +
          `• Status: ${detailResult.status || 'N/A'}\n` +
          `• Network: ${detailResult.network || 'N/A'}\n` +
          `• Studio: ${detailResult.studio || 'N/A'}\n` +
          `• Released: ${detailResult.released || 'N/A'}\n` +
          `• Duration: ${detailResult.duration || 'N/A'}\n` +
          `• Country: ${detailResult.country || 'N/A'}\n` +
          `• Episodes: ${detailResult.episodes || 'N/A'}\n` +
          `• Genres: ${detailResult.genres.join(', ') || 'N/A'}\n\n` +
          `• Episode List:\n${detailResult.episodesList.map((ep, i) => `  ${i + 1}. ${ep.epTitle}: ${ep.epUrl}`).join('\n') || 'Tidak ada episode'}`;
        await conn.sendMessage(m.chat, {
          text: detailText,
          contextInfo: {
            externalAdReply: {
              title: detailResult.title,
              body: `Detail anime`,
              thumbnailUrl: detailResult.thumbnail || 'https://animexin.dev/wp-content/uploads/2023/10/default.jpg',
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

      case 'download':
        if (!args[1]) throw 'Masukkan URL untuk link download.';
        const downloadResult = await animexinDownload(args[1]);
        let downloadText = `*${downloadResult.title}*\n\n` +
          `• Link Download:\n${downloadResult.downloads.map((d, i) => `  ${i + 1}. ${d.label}: ${d.link} (${d.section})`).join('\n') || 'Tidak ada link download'}`;
        await conn.sendMessage(m.chat, {
          text: downloadText,
          contextInfo: {
            externalAdReply: {
              title: downloadResult.title,
              body: `Link download`,
              thumbnailUrl: downloadResult.thumbnail || 'https://animexin.dev/wp-content/uploads/2023/10/default.jpg',
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
        throw `Perintah tidak dikenali. Gunakan: *${command} search <judul>*, *${command} detail <url>*, atau *${command} download <url>*`;
    }
  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: `${error.message || error}` }, { quoted: m });
  }
};

handler.command = /^(animexin)$/i;
handler.help = ['animexin <type> <query/url>'];
handler.tags = ['anime'];
handler.limit = true;
handler.register = true;

module.exports = handler;

async function animexinSearch(query) {
  const url = `${BASE_URL}${SEARCH_PATH}${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];
  $('.listupd article.bs').each((i, el) => {
    const title = cleanText($(el).find('.tt h2').text());
    const link = cleanUrl($(el).find('a').attr('href'));
    const img = cleanUrl($(el).find('img').attr('src'));
    const status = cleanText($(el).find('.epx').text());
    if (title && link) {
      results.push({ title, link, img, status });
    }
  });
  return results;
}

async function animexinDetail(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const infox = $('.infox').first();

  const title = cleanText($('title').text().replace(/- AnimeXin$/i, ''));
  const thumbnail = cleanUrl($('.thumb img').attr('src')); // Ambil thumbnail dari halaman detail
  let status = '', network = '', studio = '', released = '', duration = '', country = '', episodes = '';
  infox.find('.info-content .spe span').each((i, el) => {
    const text = cleanText($(el).text());
    if (text.startsWith('Status:')) status = text.replace('Status:', '').trim();
    else if (text.startsWith('Network:')) network = $(el).find('a').text().trim() || text.replace('Network:', '').trim();
    else if (text.startsWith('Studio:')) studio = $(el).find('a').text().trim() || text.replace('Studio:', '').trim();
    else if (text.startsWith('Released:')) released = text.replace('Released:', '').trim();
    else if (text.startsWith('Duration:')) duration = text.replace('Duration:', '').trim();
    else if (text.startsWith('Country:')) country = $(el).find('a').text().trim() || text.replace('Country:', '').trim();
    else if (text.startsWith('Episodes:')) episodes = text.replace('Episodes:', '').trim();
  });

  const genres = [];
  infox.find('.genxed a').each((i, el) => {
    const g = cleanText($(el).text());
    if (g) genres.push(g);
  });

  const episodesList = [];
  $('.eplister ul li a').each((i, el) => {
    const epTitle = cleanText($(el).text());
    const epUrl = cleanUrl($(el).attr('href'));
    if (epUrl) episodesList.push({ epTitle, epUrl });
  });

  return { title, status, network, studio, released, duration, country, episodes, genres, episodesList, thumbnail };
}

async function animexinDownload(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = cleanText(
    $('.single-info .infox h1').text() ||
    $('.single-info .infox h2').text() ||
    $('title').text().replace('- AnimeXin', '')
  );
  const thumbnail = cleanUrl($('.thumb img').attr('src')); // Ambil thumbnail dari halaman download

  const downloads = [];
  const backupDownloads = [];

  $('.postbody a[href]').each((i, el) => {
    const rawLink = $(el).attr('href');
    const link = cleanUrl(rawLink);
    const label = cleanText($(el).text()).toLowerCase();

    if (!link) return;

    if (
      label.includes('gdrive') ||
      label.includes('google drive') ||
      label.includes('terabox') ||
      label.includes('mirror') ||
      label.includes('mediafire')
    ) {
      if (!downloads.find(x => x.link === link)) {
        downloads.push({ section: 'Subtitle Indonesia / English', label: cleanText($(el).text()), link });
      }
    } else {
      if (!backupDownloads.find(x => x.link === link)) {
        backupDownloads.push({ section: 'Other', label: cleanText($(el).text()), link });
      }
    }
  });

  if (downloads.length === 0 && backupDownloads.length > 0) {
    for (const d of backupDownloads) {
      if (downloads.length >= 3) break;
      downloads.push(d);
    }
  } else if (downloads.length < 3) {
    for (const d of backupDownloads) {
      if (downloads.length >= 3) break;
      if (!downloads.find(x => x.link === d.link)) {
        downloads.push(d);
      }
    }
  }

  return { title, downloads, thumbnail };
}