/*PLUGINS CJS 
Fitur Porno The hentai Downloader
*Sumber:* https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X_
*/

const axios = require('axios');
const { proto } = require("@adiwajshing/baileys");

async function theHentaiDownloader(url) {
  const apiUrl = `https://api.privatezia.biz.id/api/anime/thehentai-download?url=${encodeURIComponent(url)}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status || !data.data || !data.data.gallery || data.data.gallery.length === 0) {
      throw new Error(data.message || 'Tidak ada galeri yang ditemukan dari API.');
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching TheHentai gallery:', error.message);
    if (error.response && error.response.data) {
      console.error('TheHentai API Response:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal mengunduh dari TheHentai: ${error.message}`);
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
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
        return conn.reply(m.chat, `Mau download galeri dari TheHentai? Berikan URL-nya!\nContoh: *${usedPrefix + command}* https://en.thehentai.net/xxxx`, fkontak);
    }
    
    if (!text.includes('thehentai.net')) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link TheHentai.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const result = await theHentaiDownloader(text);
        const maxImages = Math.min(result.gallery.length, 10);

        await conn.reply(m.chat, `🔞 *Galeri ditemukan!* Mengirim *${maxImages}* gambar dari total *${result.gallery.length}*...\n\nJudul: ${result.title}\nDeskripsi: ${result.description}`, fkontak);

        for (let i = 0; i < maxImages; i++) {
            const image = result.gallery[i];
            
            
            const imageBuffer = (await axios.get(image.imgSrc, { responseType: 'arraybuffer' })).data;
            
            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `🖼️ Gambar ${i + 1}/${maxImages}`,
                mimetype: 'image/jpeg'
            }, { quoted: fkontak });

            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin TheHentai Downloader:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mendownload galeri: ${e.message}.`, fkontak);
    }
};

handler.help = ['thentaidl <url>'];
handler.tags = ['nsfw', 'premium'];
handler.command = /^(thentaidl|thdl|thehentaidownloader)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;