const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) {
        return conn.reply(m.chat, `Masukin teksnya woy!\n\nContoh: *${usedPrefix + command}* Kapan nikah?`, fkontak);
    }

    try {
        await conn.reply(m.chat, 'Sabar, lagi dibuatin gambarnya...', fkontak);

      
        const response = await axios.get(`https://api.zenzxz.my.id/maker/ngl?text=${encodeURIComponent(text)}`, {
            responseType: 'arraybuffer'
        });

       
        await conn.sendFile(
            m.chat,
            response.data, 
            'ngl.jpg',
            `Nih NGL-nya! ✨`,
            fkontak
        );

    } catch (error) {
        console.error("Error creating NGL image:", error);
        await conn.reply(m.chat, 'Gagal membuat gambar. Mungkin API-nya lagi ada masalah, coba lagi nanti.', fkontak);
    }
};

handler.help = ['fakengl <teks>'];
handler.tags = ['maker', 'tools'];
handler.command = ['fakengl'];
handler.limit = true;

module.exports = handler;