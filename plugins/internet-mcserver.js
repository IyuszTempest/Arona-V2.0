/*Plugins CJS 
Minecraft Server Info
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
        return conn.reply(m.chat, `Mana IP atau hostname server Minecraft-nya, masbro?\n\nContoh: *${usedPrefix + command}* play.hypixel.net`, fkontak);
    }

    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        const ip = args.join(' ');
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://fgsi.koyeb.app/api/information/mcs?apikey=${global.fgsiapi}&ip=${encodeURIComponent(ip)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { accept: "application/json" }
        });
        
        if (!data.status || !data.data || !data.data.ip) {
            return conn.reply(m.chat, data.message || 'Gagal mengambil data server. Mungkin IP/hostname salah atau server sedang offline.', fkontak);
        }

        const details = data.data;
        
        let message = `*— Info Server Minecraft —*\n\n`;
        message += `*IP/Hostname:* ${details.ip}\n`;
        message += `*Status:* ${details.online ? '✅ Online' : '❌ Offline'}\n`;
        message += `*Versi:* ${details.version}\n`;
        message += `*Pemain:* ${details.players.online}/${details.players.max}\n`;
        message += `*Deskripsi:* ${details.description}\n`;
        
        await conn.sendMessage(m.chat, {
            image: { url: details.icon },
            caption: message.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['mcserver <ip/hostname>'];
handler.tags = ['internet'];
handler.command = /^(mcserver)$/i;
handler.limit = true;

module.exports = handler;
