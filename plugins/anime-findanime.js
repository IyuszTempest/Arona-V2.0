/**
    @ ✨ Scrape Anime Finder (Char Detector)
    @ Base: https://www.animefinder.xyz/
    @ Source: https://whatsapp.com/channel/0029VaAMjXT4yltWm1NBJV3J
**/

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); // Tambahkan fs jika nanti perlu simpan/baca file lokal

async function identifyAnime(imageUrl) {
  if (!imageUrl) throw new Error('Link gambar ga boleh kosong');

  try {
    const imageBuffer = (await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    })).data;

    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'anime.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post('https://www.animefinder.xyz/api/identify', form, {
      headers: {
        ...form.getHeaders(),
        'Origin': 'https://www.animefinder.xyz',
        'Referer': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36', // Tambahkan User-Agent standar
      },
      maxBodyLength: Infinity,
    });

    const result = response.data;

    // Tambahkan validasi jika hasil tidak seperti yang diharapkan
    if (!result || !result.animeTitle) {
        throw new Error('Respons API tidak valid atau anime tidak ditemukan.');
    }

    return {
      status: true,
      image: imageUrl,
      anime: result.animeTitle,
      character: result.character,
      genres: result.genres,
      premiere: result.premiereDate,
      production: result.productionHouse,
      description: result.description,
      synopsis: result.synopsis,
      references: result.references || []
    };

  } catch (err) {
    console.error('Error in identifyAnime:', err.message || err);
    return {
      status: false,
      message: 'Gagal mengidentifikasi anime dari gambar',
      error: err.response?.data || err.message
    };
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

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    // Memastikan input adalah gambar
    if (!mime || !mime.startsWith('image/')) {
        return conn.reply(m.chat, `Kirim gambar atau reply gambar dengan caption ${usedPrefix + command} untuk mencari tahu info animenya.`, fkontak);
    }
    
    // Pastikan gambar di-download
    let imageUrl;
    try {
        const buffer = await q.download();
        // Upload gambar ke suatu tempat jika direct link dari WhatsApp tidak bisa langsung diakses oleh API AnimeFinder
        // Untuk saat ini, kita asumsikan link dari WhatsApp bisa langsung dipakai atau butuh upload.
        // Jika perlu upload, bisa pakai modul uploadFile lo (yang sudah ada di bot lo)
        // Contoh: const { uploadFile } = require('../lib/uploadFile'); imageUrl = await uploadFile(buffer);
        // Untuk sementara, kita asumsikan bisa pakai link gambar dari WhatsApp
        // atau user akan provide link langsung.
        // Jika user memberikan URL, gunakan URL tersebut. Jika tidak, coba ambil dari quoted message.
        if (text && text.startsWith('http')) {
            imageUrl = text;
        } else {
            // Ambil URL langsung dari Baileys jika memungkinkan atau minta user upload dulu
            // Sebagai alternatif, bot perlu punya fungsi upload gambar ke telegra.ph atau sejenisnya
            // agar bisa mendapatkan URL publik yang bisa diakses oleh Anime Finder.
            // Untuk demo, kita asumsikan imageUrl didapat dari quoted message (jika sudah ada url-nya)
            // Atau, lo bisa tambahkan fungsi uploadFile di sini.
            return conn.reply(m.chat, `Mohon tunggu. Mengidentifikasi anime dari gambar...`, fkontak); // Beri pesan tunggu
            
            // Contoh jika ingin upload dulu:
            const uploadFile = require('../lib/uploadFile'); // Pastikan ini ada
            imageUrl = await uploadFile(buffer);
            if (!imageUrl) throw new Error('Gagal mengunggah gambar ke server sementara.');
        }

    } catch (e) {
        console.error('Error saat menyiapkan gambar:', e);
        return conn.reply(m.chat, `Gagal menyiapkan gambar: ${e.message}`, fkontak);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

        const result = await identifyAnime(imageUrl);

        if (result.status) {
            let caption = `✨ *Anime Ditemukan!* ✨\n\n`;
            caption += `📺 *Judul Anime:* ${result.anime || 'Tidak Diketahui'}\n`;
            caption += `🎭 *Karakter:* ${result.character || 'Tidak Diketahui'}\n`;
            caption += `📚 *Genre:* ${result.genres?.join(', ') || 'Tidak Diketahui'}\n`;
            caption += `🗓️ *Tayang Perdana:* ${result.premiere || 'Tidak Diketahui'}\n`;
            caption += `🏢 *Rumah Produksi:* ${result.production || 'Tidak Diketahui'}\n\n`;
            caption += `📖 *Sinopsis:* ${result.synopsis || result.description || 'Tidak tersedia.'}\n\n`;
            
            if (result.references && result.references.length > 0) {
                caption += `🔗 *Referensi:* \n`;
                result.references.forEach(ref => {
                    caption += `  - ${ref.site}: ${ref.url}\n`;
                });
            }

            await conn.sendMessage(m.chat, {
                image: { url: result.image || imageUrl }, // Gunakan gambar asli atau URL hasil jika ada
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: result.anime || 'Anime Info',
                        body: result.character || '',
                        thumbnailUrl: result.image || imageUrl,
                        sourceUrl: 'https://www.animefinder.xyz/',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: fkontak });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } else {
            await conn.reply(m.chat, `Gagal menemukan anime: ${result.message}\n${result.error ? `Detail: ${result.error}` : ''}`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        }

    } catch (e) {
        console.error('Error di plugin Anime Finder:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat memproses permintaan: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['findanime <reply_gambar/link_gambar>'];
handler.tags = ['anime', 'tools'];
handler.command = /^(findanime|whatanime|animeinfo)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;