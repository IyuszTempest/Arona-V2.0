/*dibantu sama Gemini
ch: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
scraper by Udin: https://whatsapp.com/channel/0029VagEmD96hENqH9AdS72V/635
*/

const axios = require('axios');
const cheerio = require('cheerio');

const baseURL = 'https://www.metrotvnews.com';

async function scrapeMetroTV() {
  try {
    const { data } = await axios.get(baseURL);
    const $ = cheerio.load(data);
    const result = {
      terbaru: [],
      detail: []
    };

    const links = [];
    $('.main-news .big-news-carousel .news-item, .main-news .small-news .news-item').each((i, el) => {
      const title = $(el).find('h1 a, h2 a').text().trim();
      const url = $(el).find('h1 a, h2 a').attr('href');
      const img = $(el).find('img').attr('src') || '';
      const kategori = $(el).find('.news-category').text().trim();

      if (title && url) {
        const fullUrl = url.startsWith('http') ? url : baseURL + url;
        result.terbaru.push({
          title,
          url: fullUrl,
          thumbnail: img.startsWith('http') ? img : baseURL + img,
          kategori
        });
        links.push(fullUrl);
      }
    });

    for (const url of links.slice(0, 3)) { // Ambil detail untuk beberapa berita saja
      const detail = await getDetailBerita(url);
      result.detail.push(detail);
    }

    return result;
  } catch (err) {
    return { status: false, message: err.message };
  }
}

async function getDetailBerita(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let scriptData = '';
    $('script').each((i, el) => {
      const html = $(el).html();
      if (html.includes('dimension6')) scriptData = html;
    });

    const title = $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';
    const publishedAt = scriptData.match(/'dimension6':\s*'([^']+)'/)?.[1] || '';
    const author = scriptData.match(/'dimension5':\s*'([^']+)'/)?.[1] || '';
    const category = scriptData.match(/'dimension7':\s*'([^']+)'/)?.[1] || '';

    const contentParagraphs = [];
    $('.news > p').each((i, el) => {
      const text = $(el).text().trim();
      if (text) contentParagraphs.push(text);
    });
    const content = contentParagraphs.join('\n\n');

    return {
      title,
      description,
      image,
      publishedAt,
      author,
      category,
      content
    };
  } catch (err) {
    return { status: false, url, message: 'Gagal mengambil detail', error: err.message };
  }
}

async function handler(m) {
  try {
    const data = await scrapeMetroTV();
    if (data && data.terbaru.length > 0) {
      let response = '*Berita Terbaru Metro TV:*\n\n';
      data.terbaru.forEach((item, index) => {
        response += `${index + 1}. *${item.title}*\n`;
        response += `Kategori: ${item.kategori}\n`;
        response += `URL: ${item.url}\n\n`;
      });

      if (data.detail.length > 0) {
        response += '*\n\nBeberapa Detail Berita Terbaru:*\n\n';
        data.detail.forEach((item, index) => {
          response += `*${item.title}*\n`;
          response += `Kategori: ${item.category}\n`;
          response += `Published At: ${item.publishedAt}\n`;
          response += `\n${item.description}\n\n`;
          response += `*Isi Berita:*\n${item.content.substring(0, 500)}...\n`;
          response += `\nBaca selengkapnya di: ${data.terbaru[index]?.url || item.url}\n\n`;
        });
      }

      m.reply(response);
    } else {
      m.reply('Gagal mengambil berita terbaru dari Metro TV.');
    }
  } catch (error) {
    console.error('Error handler metrotv:', error);
    m.reply('Terjadi kesalahan saat memproses permintaan berita.');
  }
}

handler.help = ['metrotv'];
handler.command = ['metrotv'];
handler.tags = ['news'];
handler.limit = true;

module.exports = handler;