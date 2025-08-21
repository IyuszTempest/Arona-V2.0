/*Plugins CJS 
Random Wangy Image (NSFW)
By IyuszTempest
https://whatsapp.com/channel/0029Vb6gPQsEawdrP0k43635
*/
const fetch = require('node-fetch');

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
        await conn.reply(m.chat, global.wait, fkontak);

        const apiUrl = `https://iyusztempest.my.id/api/anime/wangy`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        
        const data = await response.json();
        
        if (!data || !data.media || !data.media.url) {
            return conn.reply(m.chat, 'Gagal mendapatkan gambar dari API.', fkontak);
        }

        const imageUrl = data.media.url;

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: 'Wangy wangy wangy 😳😋'
        }, { quoted: fkontak });
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, global.eror, fkontak);
    }
};

handler.help = ['wangy'];
handler.tags = ['anime', 'nsfw', 'premium'];
handler.command = /^(wangy)$/i;
handler.premium = true;
handler.nsfw = true;

module.exports = handler;
