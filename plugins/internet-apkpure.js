/*Plugins CJS 
APKPure App Search
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
        return conn.reply(m.chat, `Mau cari aplikasi apa, masbro?\n\nContoh: *${usedPrefix + command}* tiktok`, fkontak);
    }

    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        const query = args.join(' ');
        const limit = 5; // Default limit
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/information/apkpure?apikey=${global.fgsiapi}&query=${encodeURIComponent(query)}&limit=${limit}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.results || data.data.results.length === 0) {
            return conn.reply(m.chat, data.message || 'Gagal mencari aplikasi. Mungkin tidak ditemukan.', fkontak);
        }

        const results = data.data.results;
        let message = `*— Hasil Pencarian APKPure —*\n\n`;
        
        results.forEach((item, index) => {
            message += `*${index + 1}.* *${item.title}*\n`;
            message += `_Package Name:_ ${item.packageName}\n`;
            message += `_Link:_ ${item.downloadLink}\n\n`;
        });
        
        // Kirim ikon dari hasil pertama
        await conn.sendMessage(m.chat, {
            image: { url: results[0].icon },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['apkpure <query>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(apkpure|apksearch)$/i;
handler.limit = true;

module.exports = handler;
