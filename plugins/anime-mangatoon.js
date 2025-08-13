/*Plugins CJS 
Mangatoon Info
*/
const fetch = require('node-fetch');

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

    if (!args[0]) {
        return conn.reply(m.chat, `Mana link Mangatoon-nya, masbro?\n\n*Contoh:* *${usedPrefix + command}* https://mangatoon.mobi/id/watch/496/60`, fkontak);
    }
    
    let url = args[0];
    if (!url.includes('mangatoon.mobi')) {
        return conn.reply(m.chat, 'Link tidak valid. Pastikan link-nya dari Mangatoon.', fkontak);
    }

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/mangatoon?apikey=${global.lolkey}&url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result) {
            return conn.reply(m.chat, 'Tidak ada data yang ditemukan untuk link itu. Coba lagi nanti.', fkontak);
        }

        const manga = data.result;
        
        let message = `*📖 Info Manga dari Mangatoon* 📖\n\n`;
        message += `*Judul:* ${manga.title}\n`;
        message += `*Author:* ${manga.author}\n`;
        message += `*Genre:* ${manga.genre.join(', ')}\n`;
        message += `*Deskripsi:* ${manga.description}\n`;
        message += `*Link:* ${manga.link}\n`;
        
        await conn.sendMessage(m.chat, {
            image: { url: manga.thumbnail },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['mangatoon <url>'];
handler.tags = ['anime', 'info'];
handler.command = /^(mangatoon|mangatooninfo)$/i;
handler.limit = true;

module.exports = handler;