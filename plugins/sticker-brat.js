const fetch = require('node-fetch');
const { sticker5 } = require('../lib/sticker'); 

let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, '❌ Masukkan teks untuk dibuat stiker brat.\n\n*Contoh:* .brat halo', m);

    try {
        await conn.reply(m.chat, '_Wait..._', m);

        const url = `https://api.privatezia.biz.id/api/generator/brat?text=${encodeURIComponent(text)}`;
        const res = await fetch(url, { timeout: 15000 });

        if (!res.ok) {
            throw new Error(`API merespon dengan status error: ${res.status} ${res.statusText}`);
        }

        const buffer = await res.buffer();
        if (!buffer || buffer.length < 100) {
            throw new Error('API mengembalikan data kosong atau tidak valid.');
        }

        const stiker = await sticker5(buffer, null, global.packname, global.author);

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m);
        } else {
            throw new Error('Gagal membuat stiker dari gambar yang diterima.');
        }

    } catch (e) {
        console.error(e);
        let errorMsg = `Gagal memproses permintaan. \n\n*Pesan Error Asli:*\n${e.message}`;
        if (e.message.includes('ENOTFOUND') || e.message.includes('resolve host')) {
            errorMsg += '\n\n*Server tidak ditemukan. Kemungkinan besar servernya sudah mati.';
        } else if (e.message.includes('timeout')) {
            errorMsg += '\n\n*Artinya:* Servernya ada, tapi tidak merespon (lemot parah atau mati).';
        }
        
        await conn.reply(m.chat, errorMsg, m);
    }
}

handler.help = ['brat <teks>'];
handler.tags = ['sticker'];
handler.command = /^brat$/i;
handler.limit = true;

module.exports = handler;
