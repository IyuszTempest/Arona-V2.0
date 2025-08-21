/*Plugins CJS 
Random Meme
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
        if (!global.betabotz) {
            return conn.reply(m.chat, 'Maaf, API key Betabotz belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const response = await fetch(`https://api.betabotz.eu.org/api/wallpaper/meme?apikey=${global.betabotz}`);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const buffer = await response.buffer();
        await conn.sendFile(m.chat, buffer, 'meme.jpg', '✨ Meme lucu nih, masbro!', m);

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['meme2'];
handler.tags = ['image', 'fun', 'internet'];
handler.command = /^(meme2)$/i;
handler.premium = false;

module.exports = handler;
