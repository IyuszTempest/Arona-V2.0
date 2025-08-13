/*Plugins CJS 
Wattpad Search
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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-AB-Label:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!args[0]) {
        return conn.reply(m.chat, `Mau cari cerita apa di Wattpad, masbro?\n\n*Contoh:* *${usedPrefix + command}* aldebaran`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/wattpadsearch?apikey=${global.lolkey}&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, 'Tidak ada cerita Wattpad yang ditemukan.', fkontak);
        }

        const stories = data.result.slice(0, 5); // Ambil 5 hasil pertama
        let message = `*📖 Hasil Pencarian Wattpad untuk "${query}"*:\n\n`;
        
        stories.forEach((story, index) => {
            message += `*${index + 1}.* *${story.title}*\n`;
            message += `_Author:_ ${story.author}\n`;
            message += `_Deskripsi:_ ${story.description}\n`;
            message += `_Link:_ ${story.url}\n\n`;
        });
        
        await conn.sendMessage(m.chat, {
            image: { url: stories[0].cover },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['wpsearch <query>'];
handler.tags = ['internet'];
handler.command = /^(wattpad)$/i;
handler.limit = true;

module.exports = handler;