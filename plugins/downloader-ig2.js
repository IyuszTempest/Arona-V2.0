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
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.nameowner};Bot;;;\nFN:${global.nameowner}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };

    if (!args[0]) {
        return conn.reply(m.chat, `*Contoh:* ${usedPrefix + command} https://www.instagram.com/p/ByxKbUSnubS/`, fkontak);
    }
    if (!args[0].includes('instagram.com')) {
        return conn.reply(m.chat, 'Link yang lu kasih bukan link Instagram!', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const api = await axios.get(`https://api.zenzxz.my.id/downloader/instagram?url=${encodeURIComponent(args[0])}`);
        const result = api.data.result;

        if (!result || (!result.images.length && !result.videos.length)) {
            throw new Error('Tidak ada media yang ditemukan atau link tidak valid.');
        }

        const allMedia = [...(result.images || []), ...(result.videos || [])];
        
        await conn.reply(m.chat, `Ditemukan ${allMedia.length} media. Mengirim satu per satu...`, fkontak);

        for (let i = 0; i < allMedia.length; i++) {
            const mediaUrl = allMedia[i];
            let caption = `✨ *Instagram Downloader*\n*_by @${result.username}_*`;

            if (i === 0 && result.name) {
                caption += `\n\n*Caption:*\n${result.name}`;
            }

            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1500));

            if (result.videos.includes(mediaUrl)) {
                 await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption: caption }, { quoted: fkontak });
            } else {
                 await conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption: caption }, { quoted: fkontak });
            }
        }

    } catch (e) {
        console.error('Error di plugin Instagram Downloader:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan: ${e.message || 'Tidak diketahui'}. Pastikan link valid dan publik.`, fkontak);
    }
}

handler.help = ['instagram <link>'];
handler.tags = ['downloader'];
handler.command = ['ig', 'instagram'];
handler.limit = true;

module.exports = handler;                        }),
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

handler.help = ['instagram2 <link>'];
handler.tags = ['downloader'];
handler.command = ['ig2', 'instagram2'];
handler.limit = true;

module.exports = handler;
