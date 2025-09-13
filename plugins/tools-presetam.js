const axios = require('axios');

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
        await conn.reply(m.chat, global.wait || 'Sabar, lagi nyari preset...', fkontak);

        const { data } = await axios.get('https://iyusztempest.my.id/api/tools?feature=presetam');

        if (data.status !== 'success' || !data.media?.text) {
            throw new Error('Format API tidak valid atau tidak ada data preset.');
        }

        const message = data.message;
        const author = data.author;
        const presetText = data.media.text;

        const outputText = `✨ *PRESET ALIGHT MOTION* ✨\n\n${presetText}*`;

        await conn.sendMessage(m.chat, {
            text: outputText,
            contextInfo: {
                externalAdReply: {
                    title: "Preset Jedag Jedug (JJ) 🎶",
                    body: "kumpulan Preset Alight Motion",
                    thumbnailUrl: global.thumbnailutama,
                    sourceUrl: global.instagramowner,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak });

    } catch (error) {
        console.error("Error fetching preset AM:", error);
        await conn.reply(m.chat, 'Gagal mengambil preset, masbro. Coba lagi nanti ya.', fkontak);
    }
};

handler.help = ['presetam'];
handler.tags = ['tools', 'premium'];
handler.command = ['presetam'];
handler.premium = true;
handler.limit = false;

module.exports = handler;
