/*PLUGINS CJS 
Kryuu Manga/Mahwa search
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");
async function fetchKiryuuData(query) {
  const apiUrl = `https://api.siputzx.my.id/api/anime/kiryuu?query=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(apiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!response.data || !response.data.status || !response.data.data || response.data.data.length === 0) {
      throw new Error(response.data.message || 'Gagal mendapatkan data dari Kiryuu API.');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Kiryuu data:', error.message);
    if (error.response && error.response.data) {
        console.error('Kiryuu API Response:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal mencari manga/manhwa: ${error.message}`);
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
        return conn.reply(m.chat, `Mau cari manga/manhwa apa di Kiryuu.co, masbro? Contoh: *${usedPrefix + command}* Yamada`, fkontak);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const results = await fetchKiryuuData(text);
        if (!results || results.length === 0) {
            await conn.reply(m.chat, `Tidak ada hasil ditemukan untuk "${text}" di Kiryuu.co.`, fkontak);
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return;
        }
        const carouselCards = [];
        const maxCards = Math.min(results.length, 10);
        for (let i = 0; i < maxCards; i++) {
            const item = results[i];
            const itemImageUrl = item.image || 'https://via.placeholder.com/150?text=No+Image';
            const itemDescription = item.description ? item.description.substring(0, 100) + '...' : 'Tidak ada deskripsi.';
            const itemLink = item.downloadLink || `https://kiryuu.co/?s=${encodeURIComponent(item.title)}`;
            try {
                const imageBuffer = (await axios.get(itemImageUrl, { responseType: 'arraybuffer' })).data;
                const imageMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });
                carouselCards.push({
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: `*${item.title}*\n${item.altTitle ? `(${item.altTitle})\n` : ''}` +
                              `Rating: ${item.rating || 'N/A'} | Status: ${item.status || 'N/A'}\n` +
                              `Dirilis: ${item.released || 'N/A'} | Views: ${item.views || 'N/A'}\n` +
                              `Genre: ${item.genres || 'N/A'}\n\n` +
                              `${itemDescription}`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: `Oleh: ${item.author || item.postedBy || 'N/A'}`
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: item.title.substring(0, 25) + '...',
                        subtitle: `Rating: ${item.rating || 'N/A'} | Status: ${item.status || 'N/A'}`,
                        hasMediaAttachment: true,
                        imageMessage: imageMedia.imageMessage
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📖 Baca Manga","url":"${itemLink}"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"🔍 Cari di Kiryuu","url":"https://kiryuu.co/?s=${encodeURIComponent(item.title)}"`
                            }
                        ]
                    })
                });
            } catch (cardError) {
                console.error(`Gagal memproses kartu manga ke-${i + 1} (${item.title}):`, cardError);
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
                        text: `*Sip, ${userName}!* Ini hasil pencarian Manga/Manhwa *${text}* dari Kiryuu.co:`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: "Geser aja buat liat hasil lain! 😎"
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: `📚 *Kiryuu.co Search: ${text.substring(0, 25)}...*`,
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
            await conn.reply(m.chat, `Gagal menampilkan hasil dari Kiryuu.co. Mungkin ada masalah dengan gambar atau data.`, fkontak);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('Error di plugin Kiryuu Search:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.reply(m.chat, `❌ Terjadi kesalahan saat mencari manga/manhwa: ${e.message}. Coba lagi nanti.`, fkontak);
    }
};

handler.help = ['kiryuu <query>'];
handler.tags = ['anime', 'downloader'];
handler.command = /^(kiryuu|manga|manhwa)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;
