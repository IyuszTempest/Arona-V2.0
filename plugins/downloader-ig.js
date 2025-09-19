const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");
const axios = require('axios');

let handler = async (m, { conn, args, usedPrefix, command }) => {
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

    if (!args[0]) {
        return conn.reply(m.chat, *Contoh:* ${usedPrefix + command} https://www.instagram.com/p/ByxKbUSnubS/, fkontak);
    }
    if (!args[0].includes('instagram.com')) {
        return conn.reply(m.chat, 'Link yang lu berikan bukan link Instagram yang valid woy', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const api = await axios.get(https://iyusztempest.my.id/api/downloader?feature=instagram&link=${encodeURIComponent(args[0])});
        const res = api.data;

        if (res.status !== 'success' || !res.data) {
            throw new Error(res.message || 'Gagal mengambil data dari Instagram.');
        }

        const result = res.data;
        const owner = result.owner;
        const media = result.medias.filter(item => item.type === 'video' || item.type === 'image');

        if (owner) {
            let profileMessage = *Profil Instagram Ditemukan:*\n\n;
            profileMessage += *🪪 Nama Lengkap:* ${owner.full_name || 'N/A'}\n;
            profileMessage += *👤 Username:* ${owner.username || 'N/A'}\n;
            if (owner.profile_pic_url) {
                await conn.reply(m.chat, profileMessage, fkontak);
            }
        }
        
        if (!media || media.length === 0) {
            throw new Error('Tidak ada media (gambar/video) yang bisa diunduh dari post ini.');
        }

        if (media.length === 1) {
            const mediaItem = media[0];
            let messageCaption = ✅ *Instagram Downloader*\n\n*Judul:* ${result.title || 'Tanpa Judul'}\n*Tipe:* ${mediaItem.type.toUpperCase()};
            await conn.reply(m.chat, _Mengunduh ${mediaItem.type}, mohon tunggu..._, fkontak);
            if (mediaItem.type === 'video') {
                await conn.sendMessage(m.chat, { video: { url: mediaItem.url }, caption: messageCaption }, { quoted: fkontak });
            } else if (mediaItem.type === 'image') {
                await conn.sendMessage(m.chat, { image: { url: mediaItem.url }, caption: messageCaption }, { quoted: fkontak });
            }
        } else {
            await conn.reply(m.chat, Ditemukan ${media.length} media. Membuat tampilan carousel..., fkontak);

            // --- LOGIKA CAROUSEL DIPERBAIKI TOTAL DENGAN PROMISE.ALL ---
            const cardPromises = media.slice(0, 10).map(async (mediaItem, i) => {
                let cardImageUrl = (mediaItem.type === 'image') ? mediaItem.url : (mediaItem.thumbnail || result.thumbnail);
                try {
                    const mediaBuffer = (await axios.get(cardImageUrl, { responseType: 'arraybuffer' })).data;
                    const imageMessage = (await prepareWAMessageMedia({ image: mediaBuffer }, { upload: conn.waUploadToServer })).imageMessage;
                    
                    return { // Langsung return object card yang sudah jadi
                        body: proto.Message.InteractiveMessage.Body.fromObject({ text: ✨ *Item #${i + 1}* | Tipe: ${mediaItem.type.toUpperCase()} }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: Username: @${owner.username} }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: Instagram Post Slide,
                            subtitle: result.title || 'Geser untuk melihat',
                            hasMediaAttachment: true,
                            imageMessage: imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [{
                                name: "cta_url",
                                buttonParamsJson: JSON.stringify({ display_text: Unduh Media #${i+1}, url: mediaItem.url })
                            }]
                        })
                    };
                } catch (e) {
                    console.error(Gagal memproses item carousel ke-${i+1}:, e);
                    return null; // Kembalikan null jika item ini gagal diproses
                }
            });

            // Jalankan semua promise secara paralel dan filter hasil yang gagal (null)
            const carouselCards = (await Promise.all(cardPromises)).filter(card => card !== null);
            // --- AKHIR PERBAIKAN ---

            if (carouselCards.length > 0) {
                const carouselMessage = generateWAMessageFromContent(m.chat, {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: *Hai, ${m.pushName}!* Post ini berisi ${media.length} media. }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Geser kartu untuk melihat semua media ➡" }),
                        header: proto.Message.InteractiveMessage.Header.create({ title: 📸 Instagram Downloader, hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards: carouselCards,
                            messageVersion: 1
                        })
                    })
                }, { userJid: conn.user.id, quoted: fkontak });

                await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key.id });
            } else {
                await conn.reply(m.chat, 'Gagal membuat tampilan carousel, mengirim media satu per satu...', fkontak);
                for (const mediaItem of media) {
                    await conn.sendFile(m.chat, mediaItem.url, '', *Instagram Downloader - ${mediaItem.type}*, fkontak);
                }
            }
        }

    } catch (e) {
        console.error('Error di plugin Instagram Downloader:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, Terjadi kesalahan: ${e.message || 'Tidak diketahui'}. Pastikan link valid dan publik., fkontak);
    }
}

handler.help = ['instagram <link>'];
handler.tags = ['downloader'];
handler.command = ['ig', 'instagram'];
handler.limit = true;

module.exports = handler;
