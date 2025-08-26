const axios = require('axios');
const { uploadImage } = require('../lib/uploader.js');

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

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';

    if (!/image/.test(mime)) {
        return conn.reply(m.chat, `Reply gambar yang mau dibikin HD.\n\nContoh: Reply gambar lalu ketik *${usedPrefix + command}*`, fkontak);
    }

    try {
        await conn.reply(m.chat, 'Sabar, lagi proses bikin gambarnya jadi HD...', fkontak);

        const imgBuffer = await quoted.download();

        const imgUrl = await uploadImage(imgBuffer);
        if (!imgUrl) {
            throw new Error("Gagal mengupload gambar.");
        }

        const response = await axios.get(`https://api.zenzxz.my.id/tools/remini?url=${encodeURIComponent(imgUrl)}`);
        const resultUrl = response.data.result.result_url;

        if (!resultUrl) {
            throw new Error("API tidak mengembalikan hasil.");
        }

        await conn.sendFile(
            m.chat,
            resultUrl,
            'remini_result.jpg',
            `Nih, gambarnya udah jadi HD! ✨`,
            fkontak
        );

    } catch (error) {
        console.error("Error processing Remini:", error);
        await conn.reply(m.chat, 'Gagal memproses gambar. Mungkin gambarnya terlalu besar atau API-nya lagi error.', fkontak);
    }
};

handler.help = ['remini'];
handler.tags = ['tools'];
handler.command = ['remini'];
handler.limit = true; 

module.exports = handler;