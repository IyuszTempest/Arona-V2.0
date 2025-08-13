/*Plugins CJS 
Carousel Sewa & Premium Bot (Buttons)
*/
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");
let fs = require('fs')
process.env.TZ = 'Asia/Jakarta';

let handler = async (m, { conn }) => {
    // Definisi fkontak di sini
    const fkontak = {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD
            }
        },
        participant: "0@s.whatsapp.net"
    };

    try {
        await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

        // Asumsi variabel global.gambarsewa sudah didefinisikan di config.js
        const premiumImage = await prepareWAMessageMedia({ image: { url: global.gambarsewa1 } }, { upload: conn.waUploadToServer });
        const limitImage = await prepareWAMessageMedia({ image: { url: global.gambarsewa2 } }, { upload: conn.waUploadToServer });
        const sewaBotImage = await prepareWAMessageMedia({ image: { url: global.gambarsewa3 } }, { upload: conn.waUploadToServer });
        const komplitImage = await prepareWAMessageMedia({ image: { url: global.gambarsewa4 } }, { upload: conn.waUploadToServer });

        const push = [
            {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: 💰 7 Hari : *Rp5.000*\n💰 15 Hari : *Rp8.000*\n💰 20 Hari : *Rp15.000*\n💰 30 Hari : *Rp20.000*\n💰 Permanen : *Rp45.000*\n\n\</> Benefit Premium </>`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: *✅ Benefit*:\n- Unlimited Limit\n- Akses Semua Fitur
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: "</> Premium Bot </>\n",
                    hasMediaAttachment: true,
                    ...premiumImage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: {"display_text":"Order Here!","url":"${global.storelink}"}
                        }
                    ]
                })
            },
            {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: 💳 3000 Limit : *Rp2.000*\n💳 5000 Limit : *Rp4.000*\n💳 15,000 Limit : *Rp13.000*\n💳 30,000 Limit : *Rp20.000*\n💳 50,000 : *Rp30.000*\n\n\</> Benefit Tambah Limit </>`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: *✅ Benefit*:\n- Tidak Takut Kehabisan Limit\n- Beli Limit Tanpa Premium
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: "</> Tambah Limit </>\n",
                    hasMediaAttachment: true,
                    ...limitImage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: {"display_text":"Order Here!","url":"${global.storelink}"}
                        }
                    ]
                })
            },
            {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: 💸 7 Hari : *Rp5.000* / Group\n💸 15 Hari : *Rp8.000* / Group\n💸 20 Hari : *Rp13.000* / Group\n💸 25 Hari : *Rp16.000* / Group\n💸 30 Hari : *Rp20.000* / Group\n💸 50 Hari: *Rp30.000* / Group\n\n\</> Benefit Sewa </>`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: *✅ Benefit*:\n- Auto Welcome\n- Auto Detect NSFW\n- Auto kick
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: "</> Sewa Bot </>\n",
                    hasMediaAttachment: true,
                    ...sewaBotImage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: {"display_text":"Order Here!","url":"${global.storelink}"}
                        }
                    ]
                })
            },
            {
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: Paket Komplit Permanen:\n✨ Hanya *Rp75.000* ✨\n\n\</> Benefit Paket Komplit </>`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: *✅ Benefit*:\n- Sewa & Premium Permanen\n- Lebih Hemat dan Praktis
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: "</> Paket Komplit </>\n",
                    hasMediaAttachment: true,
                    ...komplitImage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: {"display_text":"Order Here!","url":"${global.storelink}"}
                        }
                    ]
                })
            }
        ];

        const bot = generateWAMessageFromContent(m.chat, {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: *Hello, ${m.pushName}!* 👋\nSilahkan cek produk di bawah! Jika berminat, hubungi owner kami.
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: Powered By ${global.wm}
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                    hasMediaAttachment: false
                }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                    cards: push
                })
            })
        }, { quoted: fkontak });

        await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error di plugin carousel:", e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, Waduh, ada masalah pas nampilin menu sewa. Coba lagi nanti ya!, fkontak);
    }
};

handler.help = ["sewabot", "premium"];
handler.tags = ["main"];
handler.command = /^(sewa|sewabot|premium|buylimit|tambahlimit)$/i;
handler.private = false;

module.exports = handler;
