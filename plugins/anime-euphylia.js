const axios = require('axios');

let handler = async (m, { conn, command }) => {
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
        await conn.reply(m.chat, global.wait || 'Sabar, lagi nyari gambar my bini..', fkontak);

        
        const { data } = await axios.get('https://iyusztempest.my.id/api/anime?feature=euphy');

        if (data.status !== 'success' || !data.media?.url) {
            throw new Error('API tidak mengembalikan hasil yang valid.');
        }

        const imageUrl = data.media.url;
        const captionText = `Istri Owner Nih Euphylia Magenta.`;

    
        await conn.sendFile(
            m.chat,
            imageUrl,
            'euphy.jpg', 
            captionText, 
            fkontak   
        );

    } catch (error) {
        console.error("Error fetching Euphy image:", error);
        await conn.reply(m.chat, 'Gagal mengambil gambar. API-nya mokad keknya, coba lagi nanti.', fkontak);
    }
};

handler.help = ['euphyimg', 'randomeuphylia', 'randomeuphy'];
handler.tags = ['anime'];
handler.command = ['euphyimg', 'randomeuphylia', 'randomeuphy'];
handler.limit = true;

module.exports = handler;
