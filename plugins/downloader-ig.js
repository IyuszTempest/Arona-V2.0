const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys"); // Import Baileys untuk carousel
const axios = require('axios'); // Tambahkan axios untuk download buffer gambar

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Definisi fkontak di sini untuk plugin ini
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

    if (!args[0]) {
        return conn.reply(m.chat, `*Contoh:* ${usedPrefix + command} https://www.instagram.com/p/ByxKbUSnubS/`, fkontak);
    }

    // Validasi link Instagram
    if (!args[0].includes('instagram.com') && !args[0].includes('instagr.am')) {
        return conn.reply(m.chat, 'Link yang kamu berikan bukan link Instagram yang valid, masbro.', fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

    try {
        const api = await fetch(`https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(args[0])}`); // Encode URL
        const res = await api.json();

        if (!res.status) {
            throw new Error(res.message || 'Error kak, ga bisa ngambil datanya dari Instagram.');
        }

        const profile = res.result.response.profile;
        const media = res.result.response.data;

        // --- Kirim Informasi Profil (tetap terpisah) ---
        let profileMessage = `*Profile Information:*\n`;
        profileMessage += `*🪪 Full Name:* ${profile.full_name || 'N/A'}\n`;
        profileMessage += `*👤 Username:* ${profile.username || 'N/A'}\n`;
        profileMessage += `*👥 Followers Count:* ${res.result.response.statistics.user_follower_count || 'N/A'}\n`;
        profileMessage += `*📁 Media Count:* ${res.result.response.statistics.user_media_count || 'N/A'}\n`;
        
        // Coba kirim PP profile jika ada
        if (profile.profile_pic_url) {
            try {
                const ppBuffer = (await axios.get(profile.profile_pic_url, { responseType: 'arraybuffer' })).data;
                await conn.sendMessage(m.chat, { image: ppBuffer, caption: profileMessage }, { quoted: fkontak });
            } catch (ppError) {
                console.error("Gagal kirim PP Instagram profile:", ppError.message);
                await conn.sendMessage(m.chat, { text: profileMessage }, { quoted: fkontak }); // Fallback ke teks
            }
        } else {
            await conn.sendMessage(m.chat, { text: profileMessage }, { quoted: fkontak });
        }
        // --- Akhir Informasi Profil ---

        if (!media || media.length === 0) {
            throw new Error('Tidak ada media (gambar/video) ditemukan di post ini.');
        }

        // --- Logika Carousel untuk Media ---
        if (media.length === 1) { // Jika hanya 1 media (misal Reel atau Single Post)
            const mediaItem = media[0];
            let messageCaption = `✅ *Instagram Media Ditemukan!*`;
            messageCaption += `\n*Tipe:* ${mediaItem.type.toUpperCase()}\n`;
            messageCaption += `*Link Asli:* ${args[0]}`;

            await conn.reply(m.chat, `_Mengunduh ${mediaItem.type}, mohon tunggu..._`, fkontak); // Pesan proses unduh
            const mediaBuffer = (await axios.get(mediaItem.url, { // Unduh media full quality
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.instagram.com/' } 
            })).data;

            if (mediaItem.type === 'video') {
                await conn.sendMessage(m.chat, { video: mediaBuffer, caption: messageCaption }, { quoted: fkontak });
            } else if (mediaItem.type === 'image') {
                await conn.sendMessage(m.chat, { image: mediaBuffer, caption: messageCaption }, { quoted: fkontak });
            } else {
                await conn.reply(m.chat, `Tipe media tidak dikenali untuk post tunggal: ${mediaItem.type}`, fkontak);
            }
        } else { // Jika ada banyak media (carousel/slide)
            const carouselCards = [];
            const maxCarouselCards = Math.min(media.length, 10); // Batasi maksimal 10 kartu

            for (let i = 0; i < maxCarouselCards; i++) {
                const mediaItem = media[i];
                let cardImageUrl = mediaItem.thumb; // Gunakan thumbnail untuk header carousel
                let isVideoCard = mediaItem.type === 'video';
                
                try {
                    const mediaBuffer = (await axios.get(cardImageUrl, { // Unduh thumbnail ke buffer
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Referer': 'https://www.instagram.com/' 
                        }
                    })).data;

                    const imageMedia = await prepareWAMessageMedia({ image: mediaBuffer }, { upload: conn.waUploadToServer });

                    carouselCards.push({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: `✨ *Item #${i + 1}*\n\nJenis: ${mediaItem.type.toUpperCase()}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: `Dari Instagram Post`
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: `Instagram Item ${i + 1}/${media.length}`,
                            subtitle: `Tipe: ${mediaItem.type.toUpperCase()}`,
                            hasMediaAttachment: true,
                            imageMessage: imageMedia.imageMessage
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"${isVideoCard ? 'Lihat Video' : 'Lihat Gambar'}","url":"${mediaItem.url}"}` // Link ke media asli
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: `{"display_text":"Kunjungi Post","url":"${args[0]}"}` // Link ke post asli
                                }
                            ]
                        })
                    });
                } catch (cardError) {
                    console.error(`Gagal memproses item carousel ke-${i + 1} (${cardImageUrl}):`, cardError);
                    if (cardError.response) {
                        console.error(`  Status: ${cardError.response.status}, Data: ${cardError.response.data.toString()}`);
                    }
                }
            }

            if (carouselCards.length > 0) {
                const userName = m.pushName || "Masbro";
                const carouselMessage = generateWAMessageFromContent(m.chat, {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*${userName}!* Ini carousel Instagram dari link kamu:`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "Geser aja buat liat semua item! 😎"
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: `📸 *Instagram Carousel*`,
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
        console.error('Error di plugin Instagram Downloader (Vreden.my.id):', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `Terjadi kesalahan saat mendownload Instagram: ${e.message || 'Tidak diketahui'}. Pastikan link valid dan didukung.`, fkontak);
    }
}

handler.help = ['instagram <link>'];
handler.tags = ['downloader'];
handler.command = /^(ig|instagram)$/i;
handler.limit = true;

module.exports = handler;

// Fungsi sleep tidak dipakai di sini, bisa dihapus jika tidak digunakan di bagian lain
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
