const axios = require('axios');
const cheerio = require('cheerio'); 

async function theHentaiSearch(query) {
  const apiUrl = `https://api.privatezia.biz.id/api/anime/thehentai-search?query=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const data = response.data;

    if (!data || !data.status || !data.data || !data.data.posts || data.data.posts.length === 0) {
      throw new Error(data.message || 'Tidak ada hasil ditemukan dari API.');
    }
    return data.data.posts;
  } catch (error) {
    console.error('Error fetching TheHentai data:', error.message);
    if (error.response && error.response.data) {
      console.error('TheHentai API Response:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal mencari di TheHentai: ${error.message}`);
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
        return conn.reply(m.chat, `Mau cari apa, masbro? Contoh: *${usedPrefix + command}* Alya`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const posts = await theHentaiSearch(text);

        if (!posts || posts.length === 0) {
            await conn.reply(m.chat, `Tidak ada hasil ditemukan untuk "${text}".`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const maxPosts = Math.min(posts.length, 5); 

        for (let i = 0; i < maxPosts; i++) {
            const post = posts[i];
            
            let message = `🔞 *Hasil Pencarian: ${post.title}*\n\n`;
            message += `*URL:* ${post.url}\n`;
            message += `*Dilihat:* ${post.views || 'N/A'}\n`;
            message += `*Tanggal:* ${post.date || 'N/A'}\n`;

            await conn.sendMessage(m.chat, {
                image: { url: post.imgSrc || 'https://via.placeholder.com/200?text=No+Image' },
                caption: message
            }, { quoted: fkontak });

            await delay(1000);
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin TheHentai:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mencari: ${e.message}.`, fkontak);
    }
};

handler.help = ['thentaisearch <query>'];
handler.tags = ['nsfw'];
handler.command = /^(thentaisearch|ths)$/i;
handler.nsfw = true;
handler.limit = true;
handler.premium = true;

module.exports = handler;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
