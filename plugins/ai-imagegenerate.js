/*PLUGINS CJS 
AI Image Generator
*Versi Casenya:* _https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X/309_
*Sumber:* _https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X_
*/
const axios = require('axios');

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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {

        const q = args.join(' ');
        if (!q) {
            return conn.reply(m.chat, 'Masukkan teks untuk digenerate gambarnya!\nContoh: .imggenerate cewe cantik di pantai', fkontak);
        }
        
        conn.reply(m.chat, 'Sedang memproses gambar, tunggu sebentar...', fkontak);

        const res = await axios.get(`https://api.nekorinn.my.id/ai-img/capcut-genimage?text=${encodeURIComponent(q)}`, {
            responseType: 'arraybuffer'
        });

        await conn.sendMessage(m.chat, {
            image: res.data,
            caption: `✅ Berhasil generate gambar dengan teks:\n*${q}*`
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        conn.reply(m.chat, '❌ Gagal generate gambar!\nPastikan server aktif atau coba lagi nanti.', fkontak);
    }
}

handler.help = ['imggenerate <teks>']
handler.command = ['imggenerate', 'imagegenerate']
handler.tags = ['tools', 'ai']

module.exports = handler;