const axios = require('axios'); // Menggunakan require untuk CommonJS
const cheerio = require('cheerio'); // Menggunakan require untuk CommonJS

const saa = 'https://getstickerpack.com';

async function searchSticker(query) {
    try {
        const res = await axios.get(`${saa}/stickers?query=${encodeURIComponent(query)}`);
        const $ = cheerio.load(res.data);
        const packs = [];

        $('.sticker-pack-cols a').each((_, el) => {
            const title = $(el).find('.title').text().trim();
            const href = $(el).attr('href')?.trim();
            if (title && href) {
                const fullUrl = href.startsWith('http') ? href : saa + href;
                packs.push({ title, url: fullUrl });
            }
        });
        return packs;
    } catch (error) {
        console.error("Error searchSticker:", error.message);
        throw new Error(`Gagal mencari sticker pack: ${error.message}`);
    }
}

async function StickersPack(packUrl) {
    try {
        const res = await axios.get(packUrl);
        const $ = cheerio.load(res.data);
        const links = [];

        $('img.sticker-image').each((_, el) => {
            const src = $(el).attr('data-src-large'); // Ambil URL gambar besar
            if (src) links.push(src);
        });
        return links;
    } catch (error) {
        console.error("Error StickersPack:", error.message);
        throw new Error(`Gagal mengambil stiker dari pack: ${error.message}`);
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
        return conn.reply(m.chat, `Mau cari sticker pack apa, masbro? Contoh: ${usedPrefix + command} gura`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const packs = await searchSticker(text);

        if (!packs || packs.length === 0) {
            await conn.reply(m.chat, `Aduh, sticker pack "${text}" nggak ketemu. Coba kata kunci lain deh.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        // Ambil pack pertama yang ditemukan
        const selectedPack = packs[0];
        
        await conn.reply(m.chat, `Menemukan pack: *${selectedPack.title}*\nSedang mengambil semua stiker... Mohon sabar ya!`, fkontak);
        
        const stickers = await StickersPack(selectedPack.url);

        if (!stickers || stickers.length === 0) {
            await conn.reply(m.chat, `Gagal mengambil stiker dari pack "${selectedPack.title}". Mungkin pack kosong atau ada masalah.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }
        
        // Batasi jumlah stiker yang dikirim agar tidak terlalu banyak/lama
        const maxStickersToSend = 20; 
        for (let i = 0; i < Math.min(stickers.length, maxStickersToSend); i++) {
            await conn.sendImageAsSticker(m.chat, stickers[i], fkontak, { 
                packname: selectedPack.title, 
                author: 'SaaOfcBot' // Ganti dengan nama bot lo
            });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay antar stiker
        }

        if (stickers.length > maxStickersToSend) {
            await conn.reply(m.chat, `Hanya ${maxStickersToSend} stiker pertama dari pack "${selectedPack.title}" yang dikirim.`, fkontak);
        } else {
            await conn.reply(m.chat, `Berhasil mengirim ${stickers.length} stiker dari pack "${selectedPack.title}"!`, fkontak);
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Sticker Pack:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mengambil sticker pack: ${e.message}`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['stickerpack <query>'];
handler.tags = ['sticker'];
handler.command = /^(stickerpack|getpack|findsticker)$/i;
handler.limit = true; // Bisa pakai limit
handler.premium = false;

module.exports = handler;