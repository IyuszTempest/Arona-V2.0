/*Plugins CJS 
• Random Meme
• By IyuszTempest
• https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/

const fetch = require('node-fetch');

function getMediaType(url) {
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
        return 'image';
    }
    if (['mp4'].includes(ext)) {
        return 'video';
    }
    return null;
}

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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-AB-Label:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://iyusztempest.my.id/api/meme`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.media || !data.media.url) {
            return conn.reply(m.chat, 'Gagal mendapatkan meme dari API.', fkontak);
        }

        const mediaUrl = data.media.url;
        const mediaType = getMediaType(mediaUrl);

        if (mediaType === 'image') {
            await conn.sendMessage(m.chat, {
                image: { url: mediaUrl },
                caption: '「Asupan Meme Buat Lu 🗿」'
            }, { quoted: fkontak });
        } else if (mediaType === 'video') {
            await conn.sendMessage(m.chat, {
                video: { url: mediaUrl },
                caption: '「Asupan Meme Buat Lu 🗿」'
            }, { quoted: fkontak });
        } else {
            return conn.reply(m.chat, `Tipe media tidak dikenali dari URL.`, fkontak);
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['meme'];
handler.tags = ['image', 'fun', 'internet'];
handler.command = /^(randommeme|meme)$/i;
handler.limit = true;

module.exports = handler;
