const axios = require('axios');
const cheerio = require('cheerio');

const category = {
  downloading: 'downloading', // Mungkin ini default page untuk unduhan terbaru?
  mods: 'mods-minecraft-pe',
  maps: 'maps-minecraft-pe',
  textures: 'textures-minecraft-pe', // Termasuk shaders juga? Perlu dicek di webnya
  shaders: 'textures-minecraft-pe/shaders', // Ini adalah sub-kategori dari textures
};

// Fungsi scraper MCPEDL
async function McpedlSearch(categorySlug, page = 1) { // Ganti 'query' jadi 'categorySlug' biar jelas
  try {
    const url = `https://mcpedl.org/${categorySlug}/page/${page}/`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const menkrep = [];
    
    $('article.post').each((index, element) => {
      const title = $(element).find('h2.entry-title a').text().trim();
      const link = $(element).find('h2.entry-title a').attr('href');
      const thumbnail = $(element).find('.post-thumbnail img').attr('src'); // Tambahkan thumbnail

      if (title && link) {
          menkrep.push({
            title,
            link,
            thumbnail: thumbnail || 'https://mcpedl.org/wp-content/themes/mcpedl2017/assets/img/logo_small.png' // Fallback logo
          });
      }
    });
    
    return menkrep;
    
  } catch (error) {
    console.error('Error scraping MCPEDL:', error.message);
    throw new Error(`Gagal mencari di MCPEDL: ${error.message}`);
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

    const validCategories = Object.keys(category); // Ambil kunci dari objek category
    
    if (!text) {
        let exampleText = `Mau cari apa di MCPEDL, masbro? Contoh: *${usedPrefix + command} mods|2*\n\n` +
                          `Format: *${usedPrefix + command}* <kategori>|[halaman]\n` +
                          `*Kategori yang tersedia:* ${validCategories.join(', ')}\n` +
                          `*Catatan:* 'textures' mencakup shaders, tapi ada juga kategori 'shaders' khusus.\n` +
                          `Jika 'downloading' mungkin berarti halaman utama unduhan terbaru.`;
        return conn.reply(m.chat, exampleText, fkontak);
    }

    const args = text.split('|').map(arg => arg.trim());
    const queryCategory = args[0].toLowerCase(); // Kategori yang diminta
    const pageNum = parseInt(args[1]) || 1; // Halaman, default 1

    // Validasi kategori
    if (!validCategories.includes(queryCategory)) {
        return conn.reply(m.chat, `Kategori *${queryCategory}* tidak valid. Pilih dari: ${validCategories.join(', ')}`, fkontak);
    }
    // Validasi halaman
    if (isNaN(pageNum) || pageNum < 1) {
        return conn.reply(m.chat, 'Nomor halaman tidak valid. Masukkan angka positif.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const results = await McpedlSearch(category[queryCategory], pageNum); // Panggil dengan slug yang benar

        if (!results || results.length === 0) {
            await conn.reply(m.chat, `Tidak ada hasil ditemukan untuk kategori *${queryCategory}* di halaman ${pageNum}.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        let message = `✨ *MCPEDL Search: ${queryCategory.toUpperCase()} (Halaman ${pageNum})* ✨\n\n`;
        
        // Ambil hingga 5 hasil teratas
        results.slice(0, 5).forEach((item, index) => {
            message += `${index + 1}. *${item.title}*\n`;
            message += `   Link: ${item.link}\n\n`;
        });
        
        // Kirim dengan thumbnail dari hasil pertama
        const thumbnail = results[0]?.thumbnail || 'https://mcpedl.org/wp-content/themes/mcpedl2017/assets/img/logo_small.png';

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: message,
            contextInfo: {
                externalAdReply: {
                    title: `MCPEDL: ${queryCategory.toUpperCase()}`,
                    body: `Halaman ${pageNum}`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: `https://mcpedl.org/${category[queryCategory]}/`, // Link ke kategori utama
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin MCPEDL Search:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mencari di MCPEDL: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['mcpedl <kategori>|[halaman>'];
handler.tags = ['internet', 'tools']; // Kategori game atau tools
handler.command = /^(mcpedl|minecraftpe|mcpe)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;
