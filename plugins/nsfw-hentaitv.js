/*
`HENTAITV`
Note : ini hasilnya pakai sendAlbumMessage (tapi diubah ke send media biasa karena sendAlbumMessage bukan fungsi baileys-pro)
Baileys : @fizzxydev/baileys-pro
Weem :
https://whatsapp.com/channel/0029Vb9ZfML6GcGFm9aPgh0W
*/

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*• Example:* ${usedPrefix + command} loli`;

    try {
        let url = `https://fastrestapis.fasturl.cloud/sfwnsfw/hentaitv?name=${encodeURIComponent(text)}`;
        let res = await fetch(url);
        let json = await res.json();

        if (!json.result || !json.result.length) throw `Tidak ditemukan hasil untuk: *${text}*`;

        // Ambil maksimal 5 hasil aja
        const results = json.result.slice(0, 5);

        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            const caption = `*${item.title}*\n👁️ Views: ${item.views}\n🔗 Link: ${item.url}`;
            
            // Kirim gambar satu per satu
            await conn.sendMessage(m.chat, { 
                image: { url: item.thumbnail }, 
                caption: caption 
            }, { quoted: m });

            // Beri jeda sebentar biar nggak kena spam detect (opsional, bisa disesuaikan)
            await new Promise(resolve => setTimeout(resolve, 1000)); 
        }

    } catch (e) {
        console.error(e);
        await m.reply(`❌ Gagal mengambil data:\n${e.message}`);
    }
};

handler.help = ['hentaitv <query>'];
handler.tags = ['nsfw','premium'];
handler.command = /^hentaitv$/i;
handler.premium = true;
handler.nsfw = true;

module.exports = handler;
