/*
Plugin: Aptoide Search (fix)
Command: aptoide
API: https://api.zenzxz.my.id/search/aptoide?query=
Author: F6F411 x iyusztempest 
*/

const axios = require('axios');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@adiwajshing/baileys');

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
        return conn.reply(m.chat, `Masukin nama aplikasi yang mau dicari.\n\nContoh: *${usedPrefix + command} mobile legends*`, fkontak);
    }

    try {
        await conn.reply(m.chat, `🔍 Cari *${text}* di Aptoide...`, fkontak);

        const response = await axios.get(`https://api.zenzxz.my.id/search/aptoide?query=${encodeURIComponent(text)}`);
        const results = response.data.results;

        if (!results || results.length === 0) {
            return conn.reply(m.chat, `❌ Aplikasi *"${text}"* tidak ditemukan di Aptoide.`, fkontak);
        }

        const limitedResults = results.slice(0, 5);
        const cards = [];

        for (const app of limitedResults) {
            const ratingStars = '⭐'.repeat(Math.round(app.rating || 0)) + '☆'.repeat(5 - Math.round(app.rating || 0));
            const appInfo = `🧑‍💻 Dev: ${app.developer.name}\n📥 ${app.downloads.toLocaleString('id-ID')} downloads\n💾 ${app.size}\n🌟 ${ratingStars}\n🔄 ${new Date(app.lastUpdate).toLocaleDateString('id-ID')}`;

            const imageMedia = await prepareWAMessageMedia({ image: { url: app.appPhotoUrl } }, { upload: conn.waUploadToServer });

            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: appInfo
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: app.appName,
                    hasMediaAttachment: true,
                    ...imageMedia
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Download di Aptoide","url":"${app.appUrl}"}`
                        }
                    ]
                })
            });
        }

        const carouselMessage = proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards });

        const msg = generateWAMessageFromContent(m.chat, {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: `*📱 Hasil Pencarian Aptoide: ${text}*`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: `${global.wm2}`
                }),
                carouselMessage
            })
        }, { quoted: fkontak });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Error fetching Aptoide search:", error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, 'Gagal nyari aplikasi. API-nya lagi ngambek kayaknya.', fkontak);
    }
};

handler.help = ['aptoide <nama aplikasi>'];
handler.tags = ['internet'];
handler.command = /^aptoide$/i;
handler.limit = true;

module.exports = handler;