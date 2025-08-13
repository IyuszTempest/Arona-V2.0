/*Plugins CJS 
YouTube Channel Stalker
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
        return conn.reply(m.chat, `Mana link channel YouTube-nya, masbro?\n\nContoh: *${usedPrefix + command}* https://www.youtube.com/c/IyuszTempest`, fkontak);
    }
    
    let url = args[0];
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return conn.reply(m.chat, 'Link tidak valid. Pastikan link-nya dari YouTube.', fkontak);
    }

    try {
        if (!global.FGSI_API_KEY) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/information/yt-stalk?apikey=${global.FGSI_API_KEY}&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.channelName) {
            return conn.reply(m.chat, data.message || 'Gagal mengambil data channel YouTube. Mungkin link tidak valid.', fkontak);
        }

        const details = data.data;
        
        let message = `*— Info Channel YouTube —*\n\n`;
        message += `*Nama Channel:* ${details.channelName}\n`;
        message += `*Subscriber:* ${details.subscriberCount}\n`;
        message += `*Total Video:* ${details.videoCount}\n`;
        message += `*Deskripsi:* ${details.channelDescription}\n\n`;
        message += `*Link Channel:* ${details.channelUrl}\n`;
        
        await conn.sendMessage(m.chat, {
            image: { url: details.channelThumbnail },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['ytstalk <url>'];
handler.tags = ['stalk'];
handler.command = /^(ytstalk)$/i;
handler.limit = true;

module.exports = handler;
