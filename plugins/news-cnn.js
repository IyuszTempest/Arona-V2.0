/*Plugins CJS 
CNN Indonesia News Scraper
*/
const fetch = require('node-fetch');

let handler = async (m, { conn, usedPrefix, command }) => {
    // Definisi fkontak
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
    
    try {
        if (!global.betabotz) {
            return conn.reply(m.chat, 'Maaf, API key Betabotz belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.betabotz.eu.org/api/news/cnn?apikey=${global.betabotz}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, 'Gagal mengambil berita dari API.', fkontak);
        }

        let message = `*📰 Berita Terbaru dari CNN Indonesia* 📰\n\n`;
        const news = data.result.slice(0, 5); // Ambil 5 berita pertama
        
        news.forEach((item, index) => {
            message += `*${index + 1}.* ${item.berita}\n`;
            message += `_Link:_ ${item.berita_url}\n\n`;
        });
        
        await conn.sendMessage(m.chat, {
            image: { url: news[0].berita_thumb },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['cnnindo'];
handler.tags = ['news', 'info'];
handler.command = /^(cnnindo)$/i;
handler.limit = true;

module.exports = handler;