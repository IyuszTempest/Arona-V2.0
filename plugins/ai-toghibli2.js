/*Plugins CJS 
AI Image to Ghibli Style
*/
const axios = require("axios");
const uploadImage = require("../lib/uploadFile"); // Asumsi ada fungsi uploadFile.js

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
    
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/.test(mime)) {
        return conn.reply(m.chat, `Reply gambar dengan caption *${usedPrefix + command}* untuk mengubahnya jadi gaya Studio Ghibli!`, fkontak);
    }
    
    try {
        if (!global.fgsiapi) {
            return conn.reply(m.chat, 'Maaf, API key FGSI belum diisi di config.js. Silakan isi dulu ya, masbro!', fkontak);
        }

        await conn.reply(m.chat, global.wait, fkontak);

        let media = await q.download();
        let imageUrl = await uploadImage(media); // Upload gambar ke host

        const apiUrl = `https://fgsi.koyeb.app/api/ai/toGhibli?apikey=${global.fgsiapi}&url=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        const buffer = Buffer.from(response.data);

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: '✨ Berhasil diubah jadi gaya Studio Ghibli!'
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['toghibli2'];
handler.tags = ['ai',  'maker', 'premium'];
handler.command = /^(toghibli2)$/i;
handler.limit = true;
handler.premium = true;

module.exports = handler;