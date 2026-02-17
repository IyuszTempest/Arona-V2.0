/*Plugins CJS 
Random Anime Wallpaper
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
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/random/wallnime?apikey=${global.lolkey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const buffer = await response.buffer();
        
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '🖼️ Nih, wallpaper anime random buat lu!'
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['wallanime'];
handler.tags = ['anime'];
handler.command = /^(wallnime)$/i;
handler.limit = true;

module.exports = handler;
