/*
Plugin: Pixiv Search (CJS)
Command: pixivsearch / pixiv
Usage: .pixivsearch <query>
API: https://lolhuman.xyz/api/pixiv?apikey=YOUR_KEY&query=query
Author : F6F411
*/

const fetch = require('node-fetch')
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");


// ====== API KEY ======
const LOLHUMAN_KEY = global.lolkey;

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Definisi fkontak
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
        return conn.reply(m.chat,
            `Contoh pemakaian:\n${usedPrefix + command} loli kawaii\n${usedPrefix + command} alya`,
            fkontak
        );
    }

    try {
        await conn.reply(m.chat, global.wait, fkontak);

        const url = `https://lolhuman.xyz/api/pixiv?apikey=${LOLHUMAN_KEY}&query=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();

        const results = json.result || [];
        if (!Array.isArray(results) || !results.length) {
            throw new Error('Hasil tidak ditemukan.');
        }

        const cards = [];
        const maxResults = results.slice(0, 10); // Ambil maksimal 10 hasil untuk carousel

        for (const item of maxResults) {
            const imageMedia = await prepareWAMessageMedia({ image: { url: item.image } }, { upload: conn.waUploadToServer });
            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `✍️ Author: ${item.author}\n\n🔗 Link: https://www.pixiv.net/en/artworks/${item.id}`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: `📌 Title: ${item.title}\n`,
                    hasMediaAttachment: true,
                    ...imageMedia
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Lihat di Pixiv","url":"https://www.pixiv.net/en/artworks/${item.id}"}`
                        }
                    ]
                })
            });
        }

        const carouselMessage = proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: cards
        });

        const bot = generateWAMessageFromContent(m.chat, {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: `*✨ Hasil Pencarian Pixiv untuk: ${text}*`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: `Powered By ${global.wm}`
                }),
                carouselMessage: carouselMessage
            })
        }, { quoted: fkontak });

        await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('pixivsearch error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Gagal melakukan pencarian.\n• Alasan: ${err.message}`, fkontak);
    }
}

handler.help = ['pixivr18 <query>'];
handler.tags = ['nsfw', 'premium'];
handler.command = /^(pixivr18)$/i;
handler.nsfw = true;
handler.premium = true;

module.exports = handler;
