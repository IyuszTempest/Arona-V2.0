/*Plugins CJS 
Anime Wallpaper Search
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
        return conn.reply(m.chat, `Mau cari wallpaper apa, masbro?\n\n*Contoh:* *${usedPrefix + command}* loli kawaii`, fkontak);
    }

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/wallpaper?apikey=${global.lolkey}&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, 'Tidak ada wallpaper yang ditemukan untuk pencarian itu.', fkontak);
        }

        const randomResult = data.result[Math.floor(Math.random() * data.result.length)];
        
        await conn.sendMessage(m.chat, {
            image: { url: randomResult },
            caption: `🖼️ Hasil pencarian wallpaper untuk: *${query}*`
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['wallpapersearch <query>'];
handler.tags = ['image', 'anime'];
handler.command = /^(wallpapersearch|wpsearch)$/i;
handler.limit = true;

module.exports = handler;