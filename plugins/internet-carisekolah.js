/*PLUGINS CJS
Cari Sekolah
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
const cheerio = require('cheerio');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");

async function sekolahSearch(namasekolah) {
    try {
        const response = await axios.post(
            'https://sekolah.link/wp-admin/admin-ajax.php',
            new URLSearchParams({
                action: 'get_sekolah_items',
                item_location: '',
                'item-type': '',
                changed: '',
                posts_per_page: '20',
                orderby: 'title',
                order: 'ASC',
                active_map: '',
                'search-filter': namasekolah
            }).toString(),
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://sekolah.link/website-sekolah/',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (!response.data || !response.data.content) {
            throw new Error('Gagal mendapatkan data dari sekolah.link.');
        }

        const $ = cheerio.load(response.data.content);
        const result = [];

        $('.listing-islamitische-item').each((_, el) => {
            const link = $(el).find('.title-listing a').attr('href');
            const nama = $(el).find('.title-listing a').text().trim();
            const lokasi = $(el).find('.info-address').text().trim();
            const gambar = $(el).find('img').attr('src');
            
            if (nama && lokasi && link) {
                result.push({ nama, lokasi, link, gambar: gambar || 'https://via.placeholder.com/150?text=No+Image' });
            }
        });

        return result;
    } catch (error) {
        console.error('Error sekolahSearch:', error.message);
        throw new Error(`Gagal mencari sekolah: ${error.message}`);
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
        return conn.reply(m.chat, `Mau cari sekolah apa, masbro? Contoh: *${usedPrefix + command}* smp 3`, fkontak);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const results = await sekolahSearch(text);

        if (!results || results.length === 0) {
            await conn.reply(m.chat, `Tidak ada hasil ditemukan untuk "${text}".`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }

        const carouselCards = [];
        const maxCards = Math.min(results.length, 10);

        for (let i = 0; i < maxCards; i++) {
            const item = results[i];

            try {
                // Unduh gambar ke buffer dulu
                const imageBuffer = (await axios.get(item.gambar, { responseType: 'arraybuffer' })).data;
                const imageMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

                carouselCards.push({
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: `📍 Lokasi: ${item.lokasi || 'N/A'}`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: `Informasi Sekolah`
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: item.nama.substring(0, 25) + '...',
                        subtitle: item.lokasi || 'N/A',
                        hasMediaAttachment: true,
                        imageMessage: imageMedia.imageMessage
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"🌐 Kunjungi Website","url":"${item.link}"}`
                            }
                        ]
                    })
                });
            } catch (cardError) {
                console.error(`Gagal memproses kartu sekolah ke-${i + 1} (${item.nama}):`, cardError);
            }
        }

        if (carouselCards.length > 0) {
            const userName = m.pushName || "Masbro";
            const carouselMessage = generateWAMessageFromContent(m.chat, {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: `*Sip, ${userName}!* Ini hasil pencarian sekolah untuk *${text}*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: "Geser aja buat liat hasil lain! 😎"
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `🏫 *Pencarian Sekolah*`,
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
            await conn.reply(m.chat, `Gagal menampilkan hasil dari pencarian sekolah.`, fkontak);
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error di plugin Pencari Sekolah:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mencari sekolah: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['sekolah <query>'];
handler.tags = ['tools', 'internet'];
handler.command = /^(sekolah|carisekolah)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;