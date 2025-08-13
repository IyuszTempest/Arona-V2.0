/*Plugins CJS 
Info Beasiswa Indonesia
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

        const apiUrl = `https://api.lolhuman.xyz/api/indbeasiswa?apikey=${global.lolkey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, 'Tidak ada info beasiswa yang ditemukan.', fkontak);
        }

        const scholarships = data.result.slice(0, 5); // Ambil 5 hasil pertama
        let message = `*🎓 Info Beasiswa Terbaru di Indonesia* 🎓\n\n`;
        
        scholarships.forEach((item, index) => {
            message += `*${index + 1}.* *${item.title}*\n`;
            message += `_Deadline:_ ${item.deadline}\n`;
            message += `_Link:_ ${item.link}\n\n`;
        });
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['beasiswa'];
handler.tags = ['internet', 'info'];
handler.command = /^(beasiswa|infobeasiswa)$/i;
handler.limit = true;

module.exports = handler;