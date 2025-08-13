/*Plugins CJS 
Mega Downloader
*/
const axios = require("axios");

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
        return conn.reply(m.chat, `Mana link Mega.nz-nya, masbro?\n\nContoh: *${usedPrefix + command}* https://mega.nz/file/xxxxx`, fkontak);
    }
    
    let url = args[0];
    if (!url.includes('mega.nz')) {
        return conn.reply(m.chat, 'Link tidak valid. Pastikan link-nya dari Mega.nz.', fkontak);
    }

    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/downloader/mega?apikey=${global.fgsiapi}&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.download_url) {
            return conn.reply(m.chat, data.message || 'Gagal mendownload file dari Mega.nz. Mungkin link tidak valid.', fkontak);
        }

        const details = data.data;
        
        let message = `✅ *File dari Mega.nz berhasil didownload!* ✅\n\n`;
        message += `*Nama File:* ${details.title}\n`;
        message += `*Ukuran:* ${details.size}\n\n`;
        message += `*Link Download:* ${details.download_url}\n`;
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['megadl <url>'];
handler.tags = ['downloader'];
handler.command = /^(megadl|mega)$/i;
handler.limit = true;

module.exports = handler;
