/*Plugins CJS 
Grow & Garden Stock Checker
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
            return conn.reply(m.chat, 'Maaf, API key Betabotz belum diisi di config.js.', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://api.betabotz.eu.org/api/webzone/grow-and-garden-stock?apikey=${global.betabotz}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.result) {
            return conn.reply(m.chat, 'Gagal mengambil data stok dari API.', fkontak);
        }

        const stock = data.result;
        
        let message = `*— Stok Grow & Garden Hari Ini —*\n\n`;
        
        for (const category in stock) {
            const items = stock[category].items;
            const lastUpdate = stock[category].lastUpdate;
            
            message += `*📦 ${category.toUpperCase()}*\n`;
            if (items.length > 0) {
                message += items.map(item => `- ${item}`).join('\n') + '\n';
            } else {
                message += '- Tidak ada item saat ini.\n';
            }
            if (lastUpdate) {
                message += `_Update terakhir: ${lastUpdate}_\n\n`;
            } else {
                message += '\n';
            }
        }
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['growstock'];
handler.tags = ['fun'];
handler.command = /^(growstock|growgarden)$/i;
handler.limit = true;

module.exports = handler;