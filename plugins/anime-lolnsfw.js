const API_KEY_LOLHUMAN = global.lolkey;
const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!API_KEY_LOLHUMAN) {
        return conn.reply(m.chat, '❌ API Key LOLHUMAN belum diisi di config.js, harap lapor onwer!', m);
    }

    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        await conn.reply(m.chat, _Wait..._, fkontak);

        let type = command.toLowerCase();
        let apiUrl = '';

        if (type === 'loli2') {
            apiUrl = https://api.lolhuman.xyz/api/random/nsfw/loli?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'ahegao') {
            apiUrl = https://api.lolhuman.xyz/api/random/nsfw/ahegao?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'ecchi') {
            apiUrl = https://api.lolhuman.xyz/api/random/nsfw/ecchi?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'futanari') {
            apiUrl = https://api.lolhuman.xyz/api/random2/futanari?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'eroyuri') {
            apiUrl = https://api.lolhuman.xyz/api/random2/eroyuri?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'tits') {
            apiUrl = https://api.lolhuman.xyz/api/random2/tits?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'holoero') {
            apiUrl = https://api.lolhuman.xyz/api/random2/holoero?apikey=${API_KEY_LOLHUMAN};
        } else if (type === 'erokemo') {
            apiUrl = https://api.lolhuman.xyz/api/random2/erokemo?apikey=${API_KEY_LOLHUMAN};
        } else {
            return conn.reply(m.chat, '❌ Tipe tidak valid!', fkontak);
        }

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(API error: ${res.statusText});
        
        const buffer = await res.buffer();

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: 😳🤭 Random *${type}* buat bahan sange nih
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, global.eror || 'Terjadi kesalahan, coba lagi nanti.', fkontak);
    }
};

handler.help = [
    'loli2', 'ahegao', 'ecchi', 'futanari', 
    'eroyuri', 'tits', 'holoero', 'erokemo'
];
handler.tags = ['nsfw', 'premium'];
handler.command = [
    'loli2', 'ahegao', 'ecchi', 'futanari', 
    'eroyuri', 'tits', 'holoero', 'erokemo'
];
handler.premium = true;
handler.nsfw = true;
handler.limit = true;

module.exports = handler;
