/*Plugins CJS 
Nhentai Detail Grabber
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
        if (!global.betabotz) {
            return conn.reply(m.chat, 'Maaf, API key Betabotz belum diisi di config.js.', fkontak);
        }

        if (!args[0]) {
            return conn.reply(m.chat, `Masukan ID nhentainya 😳.\n\n*Contoh:* *${usedPrefix + command}* 441508`, fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const id = args[0];
        const apiUrl = `https://api.betabotz.eu.org/api/webzone/nhentai-detail?query=${id}&apikey=${global.betabotz}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.result) {
            return conn.reply(m.chat, 'Tidak ditemukan detail untuk ID tersebut, masbro.', fkontak);
        }

        const details = data.result;
        
        let message = `*— Detail Nhentai —*\n\n`;
        message += `*ID:* ${details.id}\n`;
        message += `*Judul:* ${details.title.pretty || details.title.english || 'Tidak diketahui'}\n`;
        message += `*Jumlah Halaman:* ${details.images.pages.length}\n`;
        message += `*Link:* https://nhentai.net/g/${details.id}\n`;
        message += `\n_Konten ini bersifat NSFW, gunakan dengan bijak._`;

        await conn.sendMessage(m.chat, {
            image: { url: details.images.cover.t },
            caption: message
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['nhentaidetail <id>'];
handler.tags = ['nsfw', 'premium'];
handler.command = /^(nhentaidetail)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;