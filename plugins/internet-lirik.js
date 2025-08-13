const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util'); // Untuk util.format jika diperlukan
const { URL } = require('url'); // Untuk parsing URL

const BASE_URL = "https://lirik-lagu.net";
const SEARCH_PATH = "/search";

async function LirikByPonta(query) {
  try {
    const encodedQuery = encodeURIComponent(query.trim().replace(/\s+/g, "+"));
    const url = `${BASE_URL}${SEARCH_PATH}/${encodedQuery}.html`;

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const firstResult = $(".card-body.list_main .title-list a").first();

    if (!firstResult.length) return [];

    const title = firstResult.text().trim();
    const link = BASE_URL + firstResult.attr("href"); // Pastikan link lengkap dengan BASE_URL

    return [{ title, link }];
  } catch (error) {
    console.error("Error LirikByPonta (search):", error.message);
    return [];
  }
}

async function LirikByPontaJs(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const lirikContainer = $(".post-read.lirik_lagu, #lirik_lagu").first();

    if (!lirikContainer.length) throw new Error("Kontainer lirik tidak ditemukan.");

    lirikContainer.find('script, style, div[align="center"], ins, .mt-3.pt-3, .artis, .tags, .adsbygoogle').remove();

    let htmlLirik = lirikContainer.html();
    if (!htmlLirik) throw new Error("HTML lirik kosong.");

    htmlLirik = htmlLirik.replace(/<br\s*\/?>/gi, "\n");
    let lirikText = cheerio.load(htmlLirik).text();

    const lines = lirikText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let resultLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^(\[.*\]|\(.*\))$/.test(lines[i]) && i > 0) { // Tambahkan baris kosong sebelum bagian bracket
        resultLines.push('');
      }
      resultLines.push(lines[i]);
    }

    return resultLines.join('\n');
  } catch (error) {
    console.error("Error LirikByPontaJs (get lyrics):", error.message);
    return null;
  }
}

// Handler utama plugin
const handler = async (m, { text, conn, usedPrefix, command }) => {
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
        return conn.reply(m.chat, `Masukkan judul lagu!\nContoh: ${usedPrefix + command} jauh disana`, fkontak); // Pakai fkontak
    }

    await conn.reply(m.chat, 'Sabar coyy gw proses liriknya...', fkontak); // Pakai fkontak

    try {
        const daftarLirik = await LirikByPonta(text);

        if (daftarLirik.length === 0) {
            return conn.reply(m.chat, `Tidak ditemukan lirik untuk "${text}". Coba judul lain.`, fkontak); // Pakai fkontak
        }

        // Ambil lirik dari hasil pertama
        const { title, link } = daftarLirik[0]; // Ambil hasil pertama saja
        const lirikText = await LirikByPontaJs(link);

        if (!lirikText) {
            return conn.reply(m.chat, `Gagal mengambil lirik untuk "${title}".`, fkontak); // Pakai fkontak
        }

        const captionText = `*Judul:* ${title}\n*Link:* ${link}\n\n${lirikText}`;

        await conn.reply(m.chat, captionText, fkontak); // Pakai fkontak
        
    } catch (err) {
        console.error("Terjadi kesalahan di plugin lirik (lirik-lagu.net):", err);
        conn.reply(m.chat, `Terjadi kesalahan: ${err.message || 'saat mengambil lirik dari lirik-lagu.net.'}`, fkontak); // Pakai fkontak
    }
};

handler.help = ['lirik <judul lagu>', 'lyrics <judul lagu>'];
handler.tags = ['internet']; // Atau 'tools', 'musik'
handler.command = /^lirik|lyrics$/i;
handler.limit = true; // Jika perlu limitasi

module.exports = handler;