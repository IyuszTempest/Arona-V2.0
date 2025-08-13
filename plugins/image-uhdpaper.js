const axios = require('axios');
const cheerio = require('cheerio');

async function UhdpaperSearch(query) {
  try {
    const response = await axios.get(`https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true&i=0`); // Encode query
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('article.post-outer-container').each((_, element) => {
      const title = $(element).find('.snippet-title h2').text().trim();
      const imageUrl = $(element).find('.snippet-title img').attr('src');
      const resolution = $(element).find('.wp_box b').text().trim();
      const link = $(element).find('a').attr('href');

      if (title && imageUrl && resolution && link) {
        // Pastikan link lengkap dengan base URL jika perlu, tapi uhdpaper.com biasanya kasih link lengkap
        results.push({ title, imageUrl, resolution, link });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping UHDPaper:', error.message);
    throw new Error(`Gagal mencari wallpaper di UHDPaper: ${error.message}`);
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
        return conn.reply(m.chat, `Mau cari wallpaper apa, masbro? Contoh: ${usedPrefix + command} Kamado Tanjiro`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const wallpapers = await UhdpaperSearch(text);

        if (!wallpapers || wallpapers.length === 0) {
            await conn.reply(m.chat, `Aduh, wallpaper "${text}" nggak ketemu di UHDPaper. Coba kata kunci lain deh.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        // Ambil wallpaper pertama yang ditemukan
        const firstWallpaper = wallpapers[0];
        
        // Kirim wallpaper
        await conn.sendMessage(m.chat, {
            image: { url: firstWallpaper.imageUrl },
            caption: `✨ *UHD Wallpaper Ditemukan!* ✨\n\n` +
                     `*Judul:* ${firstWallpaper.title}\n` +
                     `*Resolusi:* ${firstWallpaper.resolution}\n` +
                     `*Link:* ${firstWallpaper.link}\n\n` +
                     `_Sumber: uhdpaper.com_`,
            contextInfo: {
                externalAdReply: {
                    title: firstWallpaper.title,
                    body: `Resolusi: ${firstWallpaper.resolution}`,
                    thumbnailUrl: firstWallpaper.imageUrl,
                    sourceUrl: firstWallpaper.link,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin UHDPaper:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mencari wallpaper: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['uhdpaper <query>'];
handler.tags = ['image', 'internet','anime']; // Kategori image atau internet
handler.command = /^(uhdpaper|wallpaperhd)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;