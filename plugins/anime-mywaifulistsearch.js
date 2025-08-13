/*PLUGINS CJS
My Waifu List Search, jangan lupa ganti apikeynya
link api: _https://fgsi.koyeb.app_

*Sumber:* https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X_
*/

const axios = require('axios');

let handler = async (m, { conn, args }) => {
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
        if (!args[0]) return conn.reply(m.chat, 'Mau cari waifu siapa, masbro?\n\n*Contoh:* .waifusearch Euphyllia Magenta', fkontak);

        const waifuName = args.join(' ');
        const apiUrl = 'https://fgsi.koyeb.app/api/information/mywaifulist/search';
        
        conn.reply(m.chat, `Sedang mencari istrimu, ${waifuName}...`, fkontak);

        const { data } = await axios.get(apiUrl, {
            params: {
                apikey: global.fgsiapi,
                q: waifuName
            },
            headers: {
                accept: 'application/json'
            }
        });

        if (!data.status || !data.data || data.data.hits.length === 0) {
            return conn.reply(m.chat, `Maaf, data waifu dengan nama "${waifuName}" tidak ditemukan.`, fkontak);
        }

        const waifu = data.data.hits[0];

        const message = `*— Data Waifu Ditemukan —*\n\n` +
                        `*🌸 Nama:* ${waifu.name || 'Tidak ada data'}\n` +
                        `*💖 Nama Asli:* ${waifu.original_name || 'Tidak ada data'}\n\n` +
                        `*📖 Deskripsi:*\n${waifu.description || 'Tidak ada data'}\n\n` +
                        `*Sumber:* ${waifu.url || 'Tidak ada data'}`;

        await conn.sendMessage(m.chat, {
            image: { url: waifu.display_picture },
            caption: message
        }, { quoted: fkontak });

    } catch (e) {
        conn.reply(m.chat, `Terjadi kesalahan saat mencari waifu: ${e.message}`, fkontak);
    }
}

handler.help = ['waifusearch <nama>']
handler.command = ['waifusearch']
handler.tags = ['anime']

module.exports = handler;
