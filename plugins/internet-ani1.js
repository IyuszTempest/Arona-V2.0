// Ciri 1: Menggunakan require() untuk impor modul (gaya CJS)
const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * @typedef {Object} An1SearchResult
 * @property {string} name - Nama aplikasi.
 * @property {string} link - URL ke halaman detail.
 * @property {string} developer - Nama developer.
 * @property {string|null} rating - Rating aplikasi (skala 5).
 * @property {string} thumbnail - URL gambar thumbnail.
 */

/**
 * Mencari aplikasi di an1.com berdasarkan query.
 * @param {string} query Nama aplikasi yang dicari.
 * @returns {Promise<An1SearchResult[]>} Array berisi objek hasil pencarian.
 */
async function An1Search(query) {
  const baseUrl = 'https://an1.com/';
  const queryParams = new URLSearchParams({
    story: query,
    do: 'search',
    subaction: 'search'
  });
  const url = `${baseUrl}?${queryParams.toString()}`;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const results = [];

  $('.app_list .item_app').each((i, el) => {
    const name = $(el).find('.name a span').text().trim();
    const linkDetail = $(el).find('.name a').attr('href');
    const developer = $(el).find('.developer').text().trim();
    let rating = null;
    const ratingStyle = $(el).find('.rate_star .current-rating').attr('style');
    if (ratingStyle) {
      const match = ratingStyle.match(/width:(\d+)%/);
      if (match) {
        rating = (parseInt(match[1], 10) / 20).toFixed(1);
      }
    }
    let thumbnail = $(el).find('.img img').attr('src');
    if (thumbnail && thumbnail.startsWith('/')) {
      thumbnail = new URL(thumbnail, baseUrl).href;
    }

    if (name && linkDetail) {
      results.push({ name, link: linkDetail, developer, rating, thumbnail });
    }
  });

  return results;
}

// ... (fungsi An1Detail dan An1Download tetap sama)

/**
 * Mengambil detail aplikasi dari URL an1.com.
 * @param {string} url URL halaman detail aplikasi.
 * @returns {Promise<Object>} Objek berisi detail aplikasi.
 */
async function An1Detail(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    title: $('h1.title').first().text().trim(),
    version: $('.spec li').filter((i, el) => $(el).text().toLowerCase().includes('version')).text().replace(/Version:/i, '').trim(),
    os: $('.spec li').filter((i, el) => $(el).text().toLowerCase().includes('android')).text().trim(),
    size: $('.spec li').filter((i, el) => $(el).find('i.size').length > 0 || $(el).text().toLowerCase().includes('mb')).text().trim(),
    description: $('.description #spoiler').text().trim(),
    developer: $('.developer[itemprop="publisher"] span[itemprop="name"]').text().trim(),
    rating: $('.rate_num span[itemprop="ratingValue"]').text().trim(),
    ratingCount: $('.rate_num span[itemprop="ratingCount"]').text().trim(),
    downloadUrl: new URL($('.spec_addon a.btn-green').attr('href'), url).href,
    updated: $('.app_moreinfo_item.gplay ul.spec li time[itemprop="datePublished"]').attr('datetime') || '',
    price: $('.app_moreinfo_item.gplay ul.spec li[itemprop="offers"] span[itemprop="price"]').text().trim(),
    installs: $('.app_moreinfo_item.gplay ul.spec li').filter((i, el) => $(el).text().toLowerCase().includes('installs')).text().replace(/Installs/i, '').trim(),
  };
}

/**
 * Mengambil link download final dari halaman download an1.com.
 * @param {string} url URL halaman download.
 * @returns {Promise<Object>} Objek berisi nama file dan URL download.
 */
async function An1Download(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  return {
    fileName: $('h1.title.fbold').text().trim(),
    downloadUrl: new URL($('#pre_download').attr('href'), url).href,
  };
}


// Handler utama untuk bot
const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    switch (command) {
      case 'ani1search': {
        if (!text) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`🔍 *Senpai*, masukkan nama aplikasi!\nContoh: *${usedPrefix + command}* capcut`);
        }
        const results = await An1Search(text);
        if (!results.length) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`😢 *Senpai*, tidak ada hasil untuk "${text}".`);
        }
        let caption = `📱 *Hasil pencarian untuk "${text}"*:\n`;
        results.forEach((app, i) => {
          caption += `\n🔹 *${i + 1}. ${app.name}*\n`;
          caption += `🧑‍💻 Developer: ${app.developer}\n`;
          caption += `⭐ Rating: ${app.rating || 'N/A'}\n`;
          caption += `🔗 Detail: ${app.link}\n`;
        });
        await conn.sendMessage(m.chat, { image: { url: results[0].thumbnail }, caption: caption.trim() }, { quoted: m });
        break;
      }

      case 'ani1detail': {
        if (!text || !/https?:\/\/an1\.com/.test(text)) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`📚 *Senpai*, masukkan URL detail dari an1.com!\nContoh: *${usedPrefix + command}* https://an1.com/7029-capcut-video-editor-apk.html`);
        }
        const detail = await An1Detail(text);
        if (!detail.title) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`😢 *Senpai*, detail aplikasi tidak ditemukan.`);
        }
        let caption = `✨ *${detail.title}*\n\n` +
          `🔖 *Versi:* ${detail.version || 'N/A'}\n` +
          `📱 *OS:* ${detail.os || 'N/A'}\n` +
          `📦 *Ukuran:* ${detail.size || 'N/A'}\n` +
          `🧑‍💻 *Developer:* ${detail.developer || 'N/A'}\n` +
          `⭐ *Rating:* ${detail.rating || 'N/A'} (${detail.ratingCount || '0'} ulasan)\n` +
          `🔗 *Download Page:* ${detail.downloadUrl || 'Tidak tersedia'}`;
        await m.reply(caption);
        break;
      }

      case 'ani1download': {
        if (!text || !/https?:\/\/an1\.com/.test(text)) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`📥 *Senpai*, masukkan URL download dari an1.com!\nContoh: *${usedPrefix + command}* https://an1.com/file_7029-dw.html`);
        }
        const download = await An1Download(text);
        if (!download.fileName || !download.downloadUrl) {
          await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
          return m.reply(`😢 *Senpai*, gagal mendapatkan link download.`);
        }
        await m.reply(`✅ *Link download untuk ${download.fileName}:*\n${download.downloadUrl}`);
        break;
      }
    }
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('Error in ani1 command:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`⚠️ *Ups, terjadi kesalahan, Senpai!*\nFitur ini sedang gangguan.`);
  }
};

handler.help = ['ani1search <query>', 'ani1detail <url>', 'ani1download <url>'];
handler.tags = ['internet'];
handler.command = /^(ani1search|ani1detail|ani1download)$/i;
handler.register = true;
handler.limit = true;

module.exports = handler;