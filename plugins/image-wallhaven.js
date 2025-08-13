const axios = require("axios");
const cheerio = require("cheerio");

const BASE_URL = "https://wallhaven.cc"; // Ubah ini ke base URL aja
const RANDOM_PATH = "/random"; // Path untuk random

async function CodeTeam() { // Fungsi untuk mendapatkan URL gambar random
  try {
    const { data: html } = await axios.get(`${BASE_URL}${RANDOM_PATH}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // User-Agent yang lebih umum
      },
    });
    const $ = cheerio.load(html);
    const firstFigure = $("section.thumb-listing-page li figure.thumb").first();
    const url = firstFigure.find("a.preview").attr("href"); // Ini link ke halaman detail gambar
    if (!url) throw new Error("Gagal mendapatkan URL gambar random dari halaman utama.");
    return url;
  } catch (error) {
    console.error("Error CodeTeam (random page):", error.message);
    throw new Error(`Gagal mendapatkan gambar random: ${error.message}`);
  }
}

async function CodeTeamDetail(url) { // Fungsi untuk mendapatkan detail gambar
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", // User-Agent yang lebih umum
        "Referer": BASE_URL // Tambahkan referer
      }
    });
    const $ = cheerio.load(html);
    const title = $("title").text().replace(" - Wallhaven", "").trim() || 'N/A'; // Bersihkan " - Wallhaven"
    const uploader = $(".showcase-uploader a.username").text().trim() || 'N/A';
    const category = $("dt:contains(\"Category\")").next().text().trim() || 'N/A';
    const purity = $("dt:contains(\"Purity\")").next().text().trim() || 'N/A';
    const resolution = $(".showcase-resolution").text().trim() || 'N/A';
    const size = $("dt:contains(\"Size\")").next().text().trim() || 'N/A';
    const views = $("dt:contains(\"Views\")").next().text().trim() || 'N/A';
    const favorites = $("dt:contains(\"Favorites\")").next().text().trim() || 'N/A';
    const shortUrl = $("#wallpaper-short-url-copy").val() || 'N/A';
    const imageUrl = $("#wallpaper").attr("src"); // Ini URL gambar langsung
    const tags = $("#tags li a.tagname").map((_, el) => $(el).text().trim()).get();
    
    if (!imageUrl) throw new Error("Tidak ditemukan URL gambar langsung di halaman detail.");

    return {
      "title": title,
      "uploader": uploader,
      "category": category,
      "purity": purity,
      "resolution": resolution,
      "size": size,
      "views": views,
      "favorites": favorites,
      "shortUrl": shortUrl,
      "imageUrl": imageUrl,
      "tags": tags.length > 0 ? tags.join(', ') : 'N/A' // Join tags atau N/A
    };
  } catch (error) {
    console.error("Error CodeTeamDetail (detail page):", error.message);
    throw new Error(`Gagal mendapatkan detail gambar: ${error.message}`);
  }
}

// --- Handler Plugin Bot ---
let handler = async (m, { conn, usedPrefix, command }) => {
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

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const detailPageUrl = await CodeTeam(); // Dapatkan URL halaman detail random
        if (!detailPageUrl) throw new Error('Tidak dapat menemukan URL halaman detail random.');
        
        const wallpaperDetail = await CodeTeamDetail(detailPageUrl); // Dapatkan detail dari halaman itu
        
        if (!wallpaperDetail || !wallpaperDetail.imageUrl) {
            throw new Error('Gagal mendapatkan detail wallpaper atau URL gambar.');
        }

        let caption = `✨ *Random Wallpaper (Wallhaven)* ✨\n\n`;
        caption += `*Judul:* ${wallpaperDetail.title}\n`;
        caption += `*Uploader:* ${wallpaperDetail.uploader}\n`;
        caption += `*Kategori:* ${wallpaperDetail.category}\n`;
        caption += `*Purity:* ${wallpaperDetail.purity}\n`;
        caption += `*Resolusi:* ${wallpaperDetail.resolution}\n`;
        caption += `*Ukuran:* ${wallpaperDetail.size}\n`;
        caption += `*Dilihat:* ${wallpaperDetail.views}\n`;
        caption += `*Favorit:* ${wallpaperDetail.favorites}\n`;
        caption += `*Tags:* ${wallpaperDetail.tags}\n`;
        caption += `*Short URL:* ${wallpaperDetail.shortUrl}\n\n`;
        caption += `_Sumber: wallhaven.cc_`;

        await conn.sendMessage(m.chat, {
            image: { url: wallpaperDetail.imageUrl },
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: `Random Wallpaper: ${wallpaperDetail.title}`,
                    body: `Resolusi: ${wallpaperDetail.resolution} | Purity: ${wallpaperDetail.purity}`,
                    thumbnailUrl: wallpaperDetail.imageUrl,
                    sourceUrl: wallpaperDetail.shortUrl, // Gunakan shortUrl
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Random Wallpaper:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mengambil wallpaper random: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['randomwallpaper'];
handler.tags = ['image', 'internet'];
handler.command = /^(randomwallpaper|wallhaven)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;