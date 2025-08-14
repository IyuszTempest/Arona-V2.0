/*Plugins CJS 
Konachan Image Search (NSFW)
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
                vcard: BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD
            }
        },
        participant: "0@s.whatsapp.net"
    };
    
    if (!args[0]) {
        return conn.reply(m.chat, Mau cari gambar Konachan apa, masbro?\n\n*Contoh:* *${usedPrefix + command}* azur_lane, fkontak);
    }

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join('_'); // Konachan biasanya pakai underscore untuk spasi
        const apiUrl = https://api.lolhuman.xyz/api/konachan?apikey=${global.lolkey}&query=${encodeURIComponent(query)};
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(API error: ${response.statusText});
        
        // Langsung ambil buffer, bukan JSON
        const buffer = await response.buffer();
        
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: 🔞 Hasil pencarian Konachan untuk: *${query}*
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['konachan <query>'];
handler.tags = ['nsfw', 'premium', 'anime'];
handler.command = /^(konachan|ksearch)$/i;
handler.premium = true;
handler.limit = true;

module.exports = handler;
