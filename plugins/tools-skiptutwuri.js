/*PLUGINS CJS
Skip Link Tutwuri, jangan lupa ganti apikeynya
link api: _https://fgsi.koyeb.app_
code asli: _https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d/564_

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
        let url = args[0]
        if (!url) return m.reply('Mana Link Tutwurinya')
        
        m.reply('Sedang memproses...')
        
        let { data } = await axios.get('https://fgsi.koyeb.app/api/tools/skip/tutwuri', {
            params: {
                apikey: 'fgsiapi-1287b327-6d', // Ganti dengan API keynya!
                url
            },
            headers: {
                accept: 'application/json'
            }
        })

        let { linkGo } = data?.data || {}
        
        if (linkGo) {
            await conn.reply(m.chat, `*Link berhasil di-skip:*\n${linkGo}`, fkontak);
        } else {
            await conn.reply(m.chat, `Gagal mendapatkan link. Mungkin ada kesalahan pada link atau API.`, fkontak);
        }

    } catch (e) {
        m.reply(`Terjadi kesalahan: ${e.message}`)
    }
}

handler.help = ['skiplink']
handler.command = ['skiplink', 'skiptutwuri']
handler.tags = ['tools']

module.exports = handler;
