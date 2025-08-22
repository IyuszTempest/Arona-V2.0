/*Plugins CJS 
Random Ahegao Image (NSFW)
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
                vcard: `BEGIN:VCARD
VERSION:3.0
N:${global.nameowner ?? 'Owner'};Bot;;;
FN:${global.nameowner ?? 'Owner'}
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/random/nsfw/ahegao?apikey=${global.lolkey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const buffer = await response.buffer();
        
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '🔞 Sange kok sama kartun'
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['ahegao2'];
handler.tags = ['nsfw'];
handler.command = /^(ahegao2)$/i;
handler.nsfw = true;
handler.premium = true;
handler.limit = true;

module.exports = handler;
