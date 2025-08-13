/*Plugins CJS 
Nhentai Search
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
    
    try {
        if (!global.betabotz) {
            return conn.reply(m.chat, 'Maaf, API key Betabotz belum diisi di config.js.', fkontak);
        }

        if (!args[0]) {
            return conn.reply(m.chat, `Mau cari apa jirr 🤨\n\n*Contoh:* *${usedPrefix + command}* milf`, fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        const query = encodeURIComponent(args.join(" "));
        const apiUrl = `https://api.betabotz.eu.org/api/webzone/nhentai-search?query=${query}&apikey=${global.betabotz}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json();
        
        if (!data.status || !data.result.result || data.result.result.length === 0) {
            return conn.reply(m.chat, 'Tidak ditemukan hasil untuk pencarian itu cuy', fkontak);
        }

        let resultText = `*Hasil Pencarian Nhentai untuk "${args.join(" ")}"*:\n\n`;
        const results = data.result.result.slice(0, 5); // Ambil 5 hasil pertama
        
        for (const item of results) {
            resultText += `*ID:* ${item.id}\n`;
            resultText += `*Judul:* ${item.title.pretty || item.title.english || 'Tidak diketahui'}\n`;
            resultText += `*Jumlah Halaman:* ${item.num_pages}\n`;
            resultText += `*Link:* https://nhentai.net/g/${item.id}\n`;
            resultText += `──────────────────\n\n`;
        }

        // Kirim cover dari hasil pertama
        await conn.sendMessage(m.chat, {
            image: { url: results[0].cover.t },
            caption: resultText.trim()
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['nhentaisearch <query>'];
handler.tags = ['nsfw', 'premium'];
handler.command = /^(nhentaisearch)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;