/*Plugins CJS 
MyWaifuList News
*/
const axios = require("axios");

let handler = async (m, { conn, args, usedPrefix, command }) => {
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
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/information/mywaifulist/news?apikey=${global.fgsiapi}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || data.data.length === 0) {
            return conn.reply(m.chat, data.message || 'Gagal mengambil berita dari MyWaifuList. Coba lagi nanti.', fkontak);
        }

        const news = data.data.slice(0, 5);
        let message = `*📰 Berita Terbaru dari MyWaifuList* 📰\n\n`;
        
        news.forEach((item, index) => {
            message += `*${index + 1}.* *${item.title}*\n`;
            message += `_Link:_ ${item.url}\n\n`;
        });
        
        // Kirim thumbnail dari hasil pertama
        await conn.sendMessage(m.chat, {
            image: { url: news[0].thumbnail },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['waifunews'];
handler.tags = ['anime', 'news'];
handler.command = /^(waifunews)$/i;
handler.limit = true;

module.exports = handler;
