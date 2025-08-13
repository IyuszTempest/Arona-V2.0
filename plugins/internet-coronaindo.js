/*Plugins CJS 
Info Corona Indonesia
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
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.lolhuman.xyz/api/corona/indonesia?apikey=${global.lolkey}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.result) {
            return conn.reply(m.chat, 'Gagal mendapatkan data corona. Coba lagi nanti ya, masbro!', fkontak);
        }

        const stats = data.result;
        
        let message = `*🦠 Update Data COVID-19 Indonesia* 🦠\n\n`;
        message += `📈 *Kasus Positif:* ${stats.positif.toLocaleString('id-ID')}\n`;
        message += `📉 *Meninggal:* ${stats.meninggal.toLocaleString('id-ID')}\n`;
        message += `✅ *Sembuh:* ${stats.sembuh.toLocaleString('id-ID')}\n`;
        message += `🏥 *Sedang Dirawat:* ${stats.dirawat.toLocaleString('id-ID')}\n\n`;
        message += `_Data diambil dari API Lolhuman_`;
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['infocorona'];
handler.tags = ['info', 'internet'];
handler.command = /^(infocorona|coronaindo)$/i;
handler.limit = true;

module.exports = handler;