/*Plugins CJS 
CocoFun Video Downloader
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
        return conn.reply(m.chat, `Mana link CocoFun-nya, masbro?\n\n*Contoh:* *${usedPrefix + command}* http://i.coco.fun/short/1513tui`, fkontak);
    }
    
    let url = args[0];
    if (!url.includes('coco.fun')) {
        return conn.reply(m.chat, 'Link tidak valid. Pastikan link-nya dari CocoFun.', fkontak);
    }

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/cocofun?apikey=${global.lolkey}&url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result) {
            return conn.reply(m.chat, 'Tidak ada video yang ditemukan dari link itu. Coba lagi nanti.', fkontak);
        }

        const video = data.result;
        
        let message = `✅ *Video dari CocoFun berhasil didownload!* ✅\n\n`;
        message += `*Judul:* ${video.title}\n`;
        
        await conn.sendMessage(m.chat, {
            video: { url: video.url },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['cocofun <url>'];
handler.tags = ['downloader'];
handler.command = /^(cocofun|cocofundl)$/i;
handler.limit = true;

module.exports = handler;