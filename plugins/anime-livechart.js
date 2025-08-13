const fetch = require('node-fetch'); // Menggunakan require untuk CommonJS
const cheerio = require('cheerio'); // Menggunakan require untuk CommonJS

async function scrapeLiveChart(query) {
  const url = `https://www.livechart.me/search?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const result = $('.anime-list .anime-item').map((_, el) => {
      const $el = $(el);
      const a = $el.find('.anime-item__body__title strong a');
      const getText = (selector) => {
        const text = $el.find(selector).text().trim();
        return text || 'N/A';
      };
      const getAttr = (selector, attr) => {
        const val = $el.find(selector).attr(attr);
        return val || 'N/A';
      };
      const ratingEl = $el.find('.info .icon-star').parent().text().trim();
      const rating = ratingEl || 'N/A';

      return {
        title: a.text().trim() || 'N/A',
        link: 'https://www.livechart.me' + (a.attr('href') || ''),
        type: getText('.anime-item__body__title .title-extra'),
        date: getText('.info span:first-child'),
        rating,
        image: getAttr('.anime-item__poster-wrap img', 'src')
      };
    }).get(); // `.get()` untuk mengubah objek Cheerio menjadi array JavaScript

    return result;
  } catch (error) {
    console.error("Error scraping LiveChart:", error.message);
    throw new Error(`Gagal mencari anime di LiveChart.me: ${error.message}`);
  }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak di sini untuk plugin ini
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!text) {
        return conn.reply(m.chat, `Mau cari anime apa, masbro? Contoh: ${usedPrefix + command} Tsuki to Laika`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const animeResults = await scrapeLiveChart(text);

        if (animeResults && animeResults.length > 0) {
            let message = `✨ *Hasil Pencarian LiveChart.me* ✨\n\n`;
            
            // Ambil hingga 3 hasil teratas untuk ditampilkan
            const topResults = animeResults.slice(0, 3); 

            for (const anime of topResults) {
                message += `*Judul:* ${anime.title}\n`;
                message += `*Tipe:* ${anime.type}\n`;
                message += `*Tanggal:* ${anime.date}\n`;
                message += `*Rating:* ${anime.rating}\n`;
                message += `*Link:* ${anime.link}\n`;
                if (anime.image && anime.image !== 'N/A') {
                    // Jika ada gambar, kirim sebagai thumbnail di externalAdReply
                    message += `\n`; // Tambah spasi sebelum info berikutnya
                }
                message += `──────────────────\n\n`;
            }

            // Kirim pesan dengan thumbnail dari hasil pertama
            const firstResultImage = topResults[0].image && topResults[0].image !== 'N/A' ? topResults[0].image : 'https://www.livechart.me/static/img/logo.png'; // Fallback logo LiveChart

            await conn.sendMessage(m.chat, {
                image: { url: firstResultImage },
                caption: message,
                contextInfo: {
                    externalAdReply: {
                        title: `Anime Search: ${text}`,
                        body: 'Ditemukan di LiveChart.me',
                        thumbnailUrl: firstResultImage,
                        sourceUrl: `https://www.livechart.me/search?q=${encodeURIComponent(text)}`,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            await conn.reply(m.chat, `Aduh, anime "${text}" nggak ketemu di LiveChart.me. Coba kata kunci lain deh, masbro.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } catch (e) {
        console.error('Error di plugin LiveChart:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mencari anime: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['livechart <judul_anime>'];
handler.tags = ['anime'];
handler.command = /^(livechart)$/i;
handler.limit = true;

module.exports = handler;