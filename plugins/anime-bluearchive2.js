const axios = require('axios');

let handler = async (m, { conn, usedPrefix, command }) => {
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
        await conn.reply(m.chat, 'Sabar sensei, lagi nyari gambarnya...', fkontak);

        const response = await axios.get('https://api.zenzxz.my.id/random/ba', {
            responseType: 'arraybuffer' 
        });

        const imageBuffer = Buffer.from(response.data, 'binary');

        await conn.sendFile(
            m.chat, 
            imageBuffer, 
            'bluearchive.jpg', 
            `Nih, gambar Blue Archive-nya~ 🎮`, 
            fkontak
        );

    } catch (error) {
        console.error("Error fetching Blue Archive image:", error);
        await conn.reply(m.chat, 'Gagal ngambil gambar, API-nya lagi error kayaknya. Coba lagi nanti ya.', fkontak);
    }
};

handler.help = ['bluearchive2'];
handler.tags = ['anime', 'image'];
handler.command = ['bluearchive2'];
handler.limit = true;

module.exports = handler;