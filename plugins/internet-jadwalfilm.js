const axios = require('axios');
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('@adiwajshing/baileys');

const filmCache = {};

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

    try {

        if (text && !isNaN(text)) {
            const userCache = filmCache[m.sender];
            if (!userCache) {
                return conn.reply(m.chat, `Kamu belum mencari daftar film. Ketik *${usedPrefix}jadwalfilm* dulu ya.`, fkontak);
            }

            const index = parseInt(text) - 1;
            if (index < 0 || index >= userCache.length) {
                return conn.reply(m.chat, `Nomor film tidak valid. Pilih nomor dari 1 sampai ${userCache.length}.`, fkontak);
            }

            const movie = userCache[index];
            let detailText = `*${movie.title}*\n\n`;
            detailText += `🎬 *Genre:* ${movie.genre}\n`;
            detailText += `🕒 *Durasi:* ${movie.duration}\n`;
            detailText += `📅 *Tanggal Tayang:* ${movie.date_show}\n\n`;
            detailText += `*Sinopsis:*\n${movie.synopsis}\n\n`;
            detailText += `🎥 *Trailer:* ${movie.trailer || 'Tidak tersedia'}`;

            return await conn.sendFile(m.chat, movie.image, 'poster.jpg', detailText, fkontak);
        }

        await conn.reply(m.chat, 'Sabar ya, lagi ngecek jadwal film terbaru di bioskop...', fkontak);

        const response = await axios.get('https://api.zenzxz.my.id/info/jadwalfilm');
        const films = response.data.data;

        if (!films || films.length === 0) {
            return conn.reply(m.chat, 'Gagal mendapatkan jadwal film, coba lagi nanti.', fkontak);
        }

        filmCache[m.sender] = films;

        const cardPromises = films.map(async (film, index) => {
            const bodyText = `🎬 Genre: ${film.genre}\n🕒 Durasi: ${film.duration}\n📅 Tayang: ${film.date_show}`;
            const imageMedia = await prepareWAMessageMedia({ image: { url: film.image } }, { upload: conn.waUploadToServer });

            return {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: bodyText
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: film.title,
                    hasMediaAttachment: true,
                    ...imageMedia
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Lihat Detail',
                            id: `${usedPrefix}film ${index + 1}`
                        })
                    }]
                })
            };
        });

        const cards = await Promise.all(cardPromises);

        const carouselMessage = proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
        });
        const msg = generateWAMessageFromContent(m.chat, {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: { text: `*🎬 Jadwal Film di Bioskop Terdekat*` },
                footer: { text: global.wm2 },
                carouselMessage
            })
        }, { userJid: m.sender, quoted: fkontak });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (error) {
        console.error("Error fetching jadwal film:", error);
        delete filmCache[m.sender];
        await conn.reply(m.chat, 'Gagal ngambil data film, masbro. API-nya lagi istirahat kayaknya.', fkontak);
    }
};

handler.help = ['jadwalfilm', 'film <nomor>'];
handler.tags = ['info', 'internet'];
handler.command = ['jadwalfilm', 'film'];
handler.limit = true;

 module.exports = handler;
