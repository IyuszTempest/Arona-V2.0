// plugins/telestick.js

const axios = require('axios');

// Token Bot Telegram yang digunakan oleh scraper. 
// PERHATIAN: Pastikan ini adalah token bot Telegram yang valid dan aman.
const TELEGRAM_BOT_TOKEN = '7935827856:AAGdbLXArulCigWyi6gqR07gi--ZPm7ewhc'; 

async function telestick(url) {
    try {
        const match = url.match(/https:\/\/t\.me\/addstickers\/([^\/\?#]+)/);
        if (!match) throw new new Error('URL stiker Telegram tidak valid. Format harus seperti: https://t.me/addstickers/namastickerpack');
        
        const stickerSetName = match[1];

        // Mendapatkan info Sticker Set
        const { data: stickerSetData } = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getStickerSet?name=${stickerSetName}`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            },
            timeout: 10000 // Timeout 10 detik
        });
        
        if (!stickerSetData.ok) {
            throw new Error(`Gagal mendapatkan data sticker set: ${stickerSetData.description || 'Unknown error from Telegram API'}`);
        }

        const stickersPromises = stickerSetData.result.stickers.map(async (sticker) => {
            // Mendapatkan info file stiker (untuk mendapatkan file_path)
            const { data: fileData } = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${sticker.file_id}`, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                },
                timeout: 10000 // Timeout 10 detik
            });

            if (!fileData.ok) {
                console.warn(`Gagal mendapatkan info file untuk sticker ID ${sticker.file_id}: ${fileData.description || 'Unknown error'}`);
                return null; // Return null jika gagal, akan difilter nanti
            }
            
            return {
                emoji: sticker.emoji,
                is_animated: sticker.is_animated,
                image_url: `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`
            };
        });
        
        // Menunggu semua Promise selesai dan memfilter yang null
        const stickers = (await Promise.all(stickersPromises)).filter(s => s !== null);
        
        return {
            name: stickerSetData.result.name,
            title: stickerSetData.result.title,
            sticker_type: stickerSetData.result.sticker_type,
            stickers: stickers
        };
    } catch (error) {
        console.error('Error di fungsi telestick:', error.message);
        throw new Error(`Gagal mengambil stiker Telegram: ${error.message}. Pastikan URL benar dan token bot valid.`);
    }
}

// Handler untuk bot
async function handler(m, { conn, text, command }) {
    if (!text) {
        return conn.reply(m.chat, `Masbro, kirim link sticker Telegram dong!\nContoh: *${command} https://t.me/addstickers/LoliNeko*`, m);
    }

    if (!text.startsWith('https://t.me/addstickers/')) {
        return conn.reply(m.chat, 'Itu bukan link sticker Telegram yang valid, masbro. Formatnya harus `https://t.me/addstickers/namastickerpack`.', m);
    }

    await conn.reply(m.chat, 'Oke, gw lagi proses ambil stiker dari Telegram nih. Sabar ya...', m);

    try {
        const result = await telestick(text);

        if (!result || result.stickers.length === 0) {
            return conn.reply(m.chat, 'Aduh, nggak ada stiker yang ditemukan di link itu atau ada masalah pas ngambil datanya.', m);
        }

        let caption = `🎉 *Stiker Set Telegram Ditemukan!* 🎉\n\n`;
        caption += `*Nama Set:* ${result.title}\n`;
        caption += `*Tipe:* ${result.sticker_type}\n`;
        caption += `*Jumlah Stiker:* ${result.stickers.length}\n`;
        caption += `*Link:* ${text}\n\n`;
        caption += `_Stiker akan dikirim satu per satu ya._`;

        await conn.reply(m.chat, caption, m);

        // Kirim stiker satu per satu
        for (const sticker of result.stickers) {
            if (sticker.image_url) {
                // Untuk stiker animated (WebP), mungkin perlu konversi jika bot tidak support langsung
                // Untuk stiker biasa (PNG/WebP statis) bisa langsung dikirim
                await conn.sendImageAsSticker(m.chat, sticker.image_url, m, { packname: result.title, author: "Telegram Stickers" });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Jeda 1 detik antar stiker
            }
        }

        await conn.reply(m.chat, 'Semua stiker udah dikirim, masbro!', m);

    } catch (e) {
        console.error('Error di handler (telestick.js):', e);
        await conn.reply(m.chat, `Maaf masbro, ada error nih pas ngambil stiker Telegram: ${e.message}. Coba lagi nanti atau pastikan linknya benar ya.`, m);
    }
}

handler.help = ['telestick <link_sticker_telegram>'];
handler.tags = ['downloader', 'sticker'];
handler.command = /^(telestick|tstick)$/i;

module.exports = handler;