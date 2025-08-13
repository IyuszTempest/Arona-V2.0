/*Plugins CJS 
CapCut Downloader
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
        return conn.reply(m.chat, `Mana link CapCut-nya, masbro?\n\nContoh: *${usedPrefix + command}* https://www.capcut.com/template/xxxxx`, fkontak);
    }
    
    let url = args[0];
    if (!url.includes('capcut.com')) {
        return conn.reply(m.chat, 'Link tidak valid. Pastikan link-nya dari CapCut.', fkontak);
    }

    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/downloader/capcut?apikey=${global.fgsiapi}&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.download_url) {
            return conn.reply(m.chat, data.message || 'Gagal mendownload video dari CapCut. Mungkin link tidak valid.', fkontak);
        }

        const details = data.data;
        
        let message = `✅ *Video dari CapCut berhasil didownload!* ✅\n\n`;
        message += `*Judul:* ${details.title}\n`;
        message += `*Link Download:* ${details.download_url}\n`;
        
        await conn.sendMessage(m.chat, {
            video: { url: details.download_url },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['capcut <url>'];
handler.tags = ['downloader'];
handler.command = /^(capcut|capcutdl)$/i;
handler.limit = true;

module.exports = handler;
