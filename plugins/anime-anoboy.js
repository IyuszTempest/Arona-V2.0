/*Plugins CJS 
Anoboy Info
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

        const apiUrl = `https://fgsi.koyeb.app/api/information/anoboy?apikey=${global.fgsiapi}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.results || data.data.results.length === 0) {
            return conn.reply(m.chat, data.message || 'Gagal mengambil data Anoboy. Coba lagi nanti.', fkontak);
        }

        const results = data.data.results.slice(0, 5);
        let message = `*— Anime Terbaru dari Anoboy —*\n\n`;
        
        results.forEach((item, index) => {
            message += `*${index + 1}.* *${item.title}*\n`;
            message += `_Link:_ ${item.url}\n\n`;
        });
        
        // Kirim thumbnail dari hasil pertama
        await conn.sendMessage(m.chat, {
            image: { url: results[0].thumbnail },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['anoboy'];
handler.tags = ['anime'];
handler.command = /^(anoboy|anoboyinfo)$/i;
handler.limit = true;

module.exports = handler;
