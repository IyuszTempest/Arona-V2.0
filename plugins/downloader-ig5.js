const axios = require('axios');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys"); 

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98'; 

async function aio(url) {
    try {
        if (!url || !url.includes('http')) throw new Error('URL is required and must start with http(s)://');
        
        const { data } = await axios.post('https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink', {
            url: url
        }, {
            headers: {
                'accept-encoding': 'gzip',
                'cache-control': 'no-cache',
                'content-type': 'application/json; charset=utf-8',
                referer: 'https://auto-download-all-in-one.p.rapidapi.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 OPR/78.0.4093.184',
                'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
                'x-rapidapi-key': RAPIDAPI_KEY 
            }
        });
        
        if (data.status === 'fail' || !data.medias || data.medias.length === 0) {
            throw new Error(data.msg || 'Gagal mengambil data dari API, mungkin link tidak didukung atau key salah.');
        }

        return data; 
    } catch (error) {
        console.error('Error in aio function (for IGDL):', error.message);
        throw new Error(`Terjadi kesalahan saat mengakses API: ${error.message}`);
    }
}

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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!text) {
        return conn.reply(m.chat, `Mau download dari Instagram mana woy? Kasih link-nya! Contohnya nih: *${usedPrefix + command}* https://www.instagram.com/p/xxxxx`, fkontak);
    }

    if (!text.includes('instagram.com') && !text.includes('instagr.am')) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link Instagram yang valid ya', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); 

    try {
        const result = await aio(text);
        
        const instagramMedia = result.medias.filter(media => media.url && (media.type === 'video' || media.type === 'image'));

        if (instagramMedia.length === 0) {
            throw new Error('Tidak ditemukan media (video/gambar) yang didukung dari link Instagram ini.');
        }

        const instagramTitle = result.title || 'Instagram Post';
        const instagramSourceUrl = text;
        const botThumbnailUrl = 'https://i.ibb.co/37456Ym/download.png';

        if (instagramMedia.length === 1) {
            const media = instagramMedia[0];
            let messageCaption = `✨ *Instagram Downloader* ✨\n`;
            messageCaption += `📌 *Judul:* ${instagramTitle}\n`;
            messageCaption += `🔗 *Sumber:* Instagram\n`;
            messageCaption += `*Tipe:* ${media.type.toUpperCase()}${media.quality ? ` (${media.quality})` : ''}\n\n`;

            if (media.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: { url: media.url },
                    caption: messageCaption,
                    mimetype: media.mimeType || 'video/mp4',
                    fileName: `instagram_video.${media.ext || 'mp4'}`,
                    contextInfo: {
                        externalAdReply: {
                            title: instagramTitle,
                            body: `Dari Instagram`,
                            thumbnailUrl: media.thumbnail || botThumbnailUrl,
                            sourceUrl: instagramSourceUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
            } else if (media.type === 'image') {
                await conn.sendMessage(m.chat, {
                    image: { url: media.url },
                    caption: messageCaption,
                    mimetype: media.mimeType || 'image/jpeg',
                    fileName: `instagram_image.${media.ext || 'jpg'}`,
                    contextInfo: {
                        externalAdReply: {
                            title: instagramTitle,
                            body: `Dari Instagram`,
                            thumbnailUrl: media.thumbnail || botThumbnailUrl,
                            sourceUrl: instagramSourceUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: fkontak });
            }
        } else { 
            const carouselCards = [];
            const maxCarouselCards = Math.min(instagramMedia.length, 10); 

            for (let i = 0; i < maxCarouselCards; i++) {
                const media = instagramMedia[i];
                let cardImageUrl = media.url;
                let cardVideoUrl = null;
                let isVideoCard = media.type === 'video';

                if (isVideoCard) {
                    cardVideoUrl = media.url;
                    cardImageUrl = media.thumbnail || botThumbnailUrl; 
                }

                try {
                    const mediaBuffer = (await axios.get(cardImageUrl, { 
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://www.instagram.com/' 
                        }
                    })).data;

                    const imageMedia = await prepareWAMessageMedia({ image: mediaBuffer }, { upload: conn.waUploadToServer });

                    carouselCards.push({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `✨ *Item #${i + 1}*\n\nJenis: ${media.type.toUpperCase()}${media.quality ? ` (${media.quality})` : ''}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: `Judul: ${instagramTitle.substring(0, 50)}...`
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: `${instagramTitle.substring(0, 25)}... (Item ${i+1}/${instagramMedia.length})`,
                            subtitle: `Type: ${media.type.toUpperCase()}`,
                            hasMediaAttachment: true,
                            imageMessage: imageMedia.imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"${isVideoCard ? 'Lihat Video' : 'Lihat Gambar'}","url":"${media.url}"}`
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"Kunjungi Post","url":"${instagramSourceUrl}"}`
                                }
                            ]
                        })
                    });
                } catch (cardError) {
                    console.error(`Gagal memproses item carousel ke-${i+1} (${cardImageUrl}):`, cardError);
                    if (cardError.response) {
                        console.error(`  Status: ${cardError.response.status}, Data: ${cardError.response.data.toString()}`);
                    }
                }
            }

            if (carouselCards.length > 0) {
                const userName = m.pushName;
                const carouselMessage = generateWAMessageFromContent(m.chat, {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*${userName}!* Ini carousel Instagram dari *${instagramTitle}*`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "Geser aja buat liat semua item! 😎"
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `📸 *${instagramTitle.substring(0, 25)}...*`,
                            hasMediaAttachment: false
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards: carouselCards,
                            messageVersion: 1
                        })
                    })
                }, { userJid: conn.user.id, quoted: fkontak });

                await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key.id });
            } else {
                await conn.reply(m.chat, `Gagal menampilkan semua item dari post Instagram ini.`, fkontak);
            }
        }
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Instagram Downloader:', e);
        await conn.reply(m.chat, `Terjadi kesalahan saat mendownload Instagram: ${e.message}. Pastikan link valid dan didukung.`, fkontak);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['ig5 <link_instagram>'];
handler.tags = ['downloader'];
handler.command = /^(ig5|instagram5)$/i;
handler.limit = true; 

module.exports = handler;
