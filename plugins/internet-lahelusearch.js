const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
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

    if (!text) {
        return conn.reply(m.chat, `Masukin query pencariannya masbro!\nContoh: *${usedPrefix + command}* uma musume`, fkontak);
    }

    try {
        await conn.reply(m.chat, `🔎 Sabar masbro, lagi nyari *"${text}"* di Lahelu...`, fkontak);

        const response = await axios.get(`https://api.zenzxz.my.id/search/lahelu?q=${encodeURIComponent(text)}`);
        const results = response.data.result;

        if (!results || results.length === 0) {
            return conn.reply(m.chat, `❌ Gak nemu apa-apa buat query *"${text}"*. Coba kata kunci lain.`, fkontak);
        }

        let resultText = `*🔍 Hasil Pencarian di Lahelu*\n*Query:* ${text}\n`;
        resultText += ` Ditemukan ${results.length} hasil.\n\n`;
        
        const limitedResults = results.slice(0, 5); 

        limitedResults.forEach((item, index) => {
            const mediaType = item.mediaType === 1 ? '🎬 Video' : '🖼️ Gambar';
            resultText += `*${index + 1}. ${item.title}*\n`;
            resultText += `   👤 *Username:* ${item.username}\n`;
            resultText += `   ✨ *Tipe Media:* ${mediaType}\n`;
            resultText += `   🔗 *Post ID:* ${item.postId}\n\n`;
        });

        if (results.length > 5) {
            resultText += `*Dan ${results.length - 5} hasil lainnya...*\n\n`;
        }
        resultText += `_Bot akan mengirim media pertama sebagai preview._`;

        await conn.reply(m.chat, resultText, fkontak);

        const firstResult = results[0];
        if (firstResult && firstResult.media) {
            let caption = `*${firstResult.title}*\n\n_by: ${firstResult.username}_`;
            await conn.sendFile(m.chat, firstResult.media, '', caption, fkontak);
        }

    } catch (error) {
        console.error("Error fetching Lahelu search:", error);
        await conn.reply(m.chat, 'Gagal ngambil data, API-nya lagi bermasalah atau query-nya aneh. Coba lagi nanti ya.', fkontak);
    }
};

handler.help = ['lahelusearch <query>'];
handler.tags = ['internet'];
handler.command = ['lahelusearch'];
handler.limit = true;

module.exports = handler;