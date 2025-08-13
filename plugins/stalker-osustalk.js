/*Plugins CJS 
Osu! Player Stalker
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
        return conn.reply(m.chat, `Mau stalker pemain Osu! siapa, masbro?\n\n*Contoh:* *${usedPrefix + command}* xxhonorxx`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);
        
        const username = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/osuname/${encodeURIComponent(username)}?apikey=${global.lolkey}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.result || !data.result.name) {
            return conn.reply(m.chat, 'Gagal mendapatkan info pemain. Pastikan username-nya benar!', fkontak);
        }

        const details = data.result;
        
        let message = `*— Info Pemain Osu! —*\n\n`;
        message += `👤 *Username:* ${details.name}\n`;
        message += `📊 *Peringkat Global:* #${details.global_rank}\n`;
        message += `📈 *Peringkat PP:* ${details.pp_rank}\n`;
        message += `💯 *PP:* ${details.pp_raw}\n`;
        message += `🎯 *AkurasI:* ${details.accuracy}\n`;
        message += `🎮 *Total Permainan:* ${details.playcount}\n`;
        message += `🕰️ *Join Sejak:* ${details.join_date}\n`;
        
        await conn.sendMessage(m.chat, {
            image: { url: details.pp_pic },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['osuname <username>'];
handler.tags = ['stalk'];
handler.command = /^(osuname|osustalk)$/i;
handler.limit = true;

module.exports = handler;