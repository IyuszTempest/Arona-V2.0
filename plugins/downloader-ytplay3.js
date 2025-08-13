/*Plugins CJS 
YouTube Play
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
        return conn.reply(m.chat, `Mau cari lagu apa di YouTube, masbro?\n\n*Contoh:* *${usedPrefix + command}* melukis senja`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/ytplay?apikey=${global.lolkey}&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || !data.result.title) {
            return conn.reply(m.chat, 'Tidak ada lagu yang ditemukan di YouTube.', fkontak);
        }

        const song = data.result;
        
        let message = `🎵 *YouTube Play* 🎵\n\n`;
        message += `*Judul:* ${song.title}\n`;
        message += `*Link:* ${song.url}\n`;
        
        // Kirim thumbnail dengan info lagu
        await conn.sendMessage(m.chat, {
            image: { url: song.thumbnail },
            caption: message.trim()
        }, { quoted: fkontak });
        
        // Kirim file audio
        await conn.sendMessage(m.chat, {
            audio: { url: song.audio },
            mimetype: 'audio/mp4',
            fileName: `${song.title}.mp3`,
            ptt: true
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['ytplay3 <query>'];
handler.tags = ['downloader'];
handler.command = /^(ytplay3)$/i;
handler.limit = true;

module.exports = handler;