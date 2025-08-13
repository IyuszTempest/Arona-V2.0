/**
══ ✨ 「 *Yeonelle ID* 」 ✨ ══
 @ *Plugins CJS FakeNGL*
 @ *Author:* Yeonelle
 @ *Source Code:* https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 @ *Source API:* https://flowfalcon.dpdns.org
═══════════════
**/

const axios = require('axios');  

let yeon = async (m, { conn, text, usedPrefix, command }) => {
    const args = text.trim().split(/\s*\|\s*/);
    
    if (args.length < 2) return conn.sendMessage(m.chat, {
        text: `🚫 *Senpai*, format salah!  
Gunakan: *${usedPrefix + command}* <judul>|<teks>  
Contoh: *${usedPrefix + command}* NGL|Hai Kak Wolep`
    });

    const title = args[0];
    const textInput = args[1];

    try {
        const response = await axios.get(`https://flowfalcon.dpdns.org/imagecreator/ngl?title= ${encodeURIComponent(title)}&text=${encodeURIComponent(textInput)}`, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });

        await conn.sendMessage(m.chat, {
            image: Buffer.from(response.data, 'binary'),
            caption: `✨ *Gambar berhasil dibuat, Senpai!*  
📌 *Judul:* ${title}  
📝 *Teks:* _${textInput}_`
        });
    } catch (e) {
        console.error('Error:', e.message);
        let errorMsg = `⚠️ *Ups, terjadi kesalahan, Senpai!*  
Coba lagi nanti ya, fitur ini lagi ngambek 😅`;

        if (e.response?.status === 400) {
            errorMsg = `🚫 *Senpai*, pastikan judul dan teks diisi!  
Contoh: *${usedPrefix + command}* NGL|Hai Kak Yeon`;
        }

        await conn.sendMessage(m.chat, { text: errorMsg });
    }
};

yeon.help = ['fakengl <judul>|<teks>'];
yeon.tags = ['tools'];
yeon.command = /^fakengl$/i;
yeon.register = true;
yeon.limit = true;

module.exports = yeon;