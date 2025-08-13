/*Plugins CJS 
Brainly Search
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
        return conn.reply(m.chat, `Mau cari jawaban apa di Brainly, masbro?\n\n*Contoh:* *${usedPrefix + command}* soekarno adalah`, fkontak);
    }
    
    try {
        if (!global.lolkey) {
            return conn.reply(m.chat, 'Maaf, API key Lolhuman belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }
        
        await conn.reply(m.chat, global.wait, fkontak);

        const query = args.join(' ');
        const apiUrl = `https://api.lolhuman.xyz/api/brainly?apikey=${global.lolkey}&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.result || data.result.length === 0) {
            return conn.reply(m.chat, `Tidak ada jawaban yang ditemukan di Brainly untuk "${query}".`, fkontak);
        }

        const result = data.result[0]; // Ambil jawaban pertama
        
        let message = `*📚 Jawaban Brainly* 📚\n\n`;
        message += `*Pertanyaan:* ${result.question}\n\n`;
        message += `*Jawaban:* ${result.answer}\n`;
        
        await conn.reply(m.chat, message.trim(), fkontak);
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['brainly <query>'];
handler.tags = ['tools', 'info', 'internet'];
handler.command = /^(brainly)$/i;
handler.limit = true;

module.exports = handler;