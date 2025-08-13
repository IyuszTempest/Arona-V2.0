/*Plugins CJS 
Emoji to Image Converter
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

    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        if (!args[0]) {
            return conn.reply(m.chat, `Mau ubah emoji apa, masbro?\n\n*Contoh:* *${usedPrefix + command}* 🗿`, fkontak);
        }

        const emoji = args[0];
        
        // Cek apakah inputnya hanya satu emoji
        if (emoji.length > 2) {
            return conn.reply(m.chat, 'Hanya bisa memproses satu emoji dalam satu waktu.', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/smoji/${encodeURIComponent(emoji)}?apikey=${global.lolkey}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const buffer = await response.buffer();
        
        await conn.sendMessage(m.chat, { 
            image: buffer,
            caption: `✨ Emoji ${emoji} berhasil diubah jadi gambar!`
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['smoji <emoji>'];
handler.tags = ['maker', 'tools'];
handler.command = /^(smoji|toimg)$/i;
handler.limit = true;

module.exports = handler;