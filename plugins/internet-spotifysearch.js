/*
PLUGINS CJS 
Spotify Search
https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const axios = require('axios');

async function searchSpotify(query) {
    const apiUrl = `https://ytdlpyton.nvlgroup.my.id/spotify/search?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data.results || data.results.length === 0) {
        throw new Error(`Tidak ada hasil yang ditemukan untuk "${query}".`);
    }
    
    return data.results;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
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
        if (!args[0]) {
            return conn.reply(m.chat, `Mau cari lagu apa,\n\n*Contoh:* *${usedPrefix + command}* gradation hanatan`, fkontak);
        }

        const query = args.join(' ');
        await conn.reply(m.chat, `Sedang mencari lagu "${query}" di Spotify... ⏳`, fkontak);

        const results = await searchSpotify(query);

        let resultText = `*✅ Hasil Pencarian Spotify untuk "${query}"*\n\n`;
        
        results.slice(0, 5).forEach((item, index) => {
            resultText += `*${index + 1}.* *${item.title}*\n` +
                          `  ✨ *Artis:* ${item.artist}\n` +
                          `  🔗 *Link:* ${item.spotify_url}\n\n`;
        });

        await conn.reply(m.chat, resultText.trim(), fkontak);

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `Terjadi kesalahan saat mencari lagu: ${e.message}`, fkontak);
    }
}

handler.help = ['spotifys <query>'];
handler.command = ['spotifys', 'spotifysearch'];
handler.tags = ['internet', 'tools'];
handler.limit = true;

module.exports = handler;
