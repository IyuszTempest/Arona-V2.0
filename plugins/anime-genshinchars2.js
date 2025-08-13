/*Plugins CJS 
Genshin Impact Character Info
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

    if (!args[0]) {
        return conn.reply(m.chat, `Mau cari info karakter Genshin siapa, masbro?\n\n*Contoh:* *${usedPrefix + command}* Jean`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);
        
        const characterName = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/genshin/${encodeURIComponent(characterName)}?apikey=${global.lolkey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.result || !data.result.title) {
            return conn.reply(m.chat, 'Gagal mendapatkan info karakter. Pastikan nama karakternya benar.', fkontak);
        }

        const details = data.result;
        
        let message = `*— Info Karakter Genshin —*\n\n`;
        message += `✨ *Nama:* ${details.title}\n`;
        message += `📜 *Tentang:* ${details.intro.replace(/\n\n/g, '\n')}\n\n`;
        message += `🗣️ *Pengisi Suara:*\n`;
        
        details.cv.forEach(cv => {
            message += `- ${cv.name}\n`;
        });
        
        await conn.sendMessage(m.chat, {
            image: { url: details.cover1 || details.icon },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['genshinchars2 <karakter>'];
handler.tags = ['anime', 'info'];
handler.command = /^(genshinchars2)$/i;
handler.limit = true;

module.exports = handler;