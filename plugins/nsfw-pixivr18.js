const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");

// Fungsi buat ambil gambar dari API Pixiv R-18 masbro
const fetchPixivR18Images = async (query) => {
  const apiUrl = `https://api.vreden.web.id/api/pixiv-r18?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(apiUrl);
    const jsonData = await response.json();
    if (jsonData.status === 200 && jsonData.result) {
      return jsonData.result;
    } else {
      console.error("API Pixiv R-18 request failed or returned unexpected data:", jsonData);
      return [];
    }
  } catch (error) {
    console.error("Error fetching Pixiv R-18 data:", error);
    return [];
  }
};

let handler = async (m, { conn, command, text }) => {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    if (!text) {
        return conn.reply(m.chat, 'Masukin dulu kata kuncinya dong, masbro. Contoh: *.pixiv18 euphylia magenta*', m);
    }

    const images = await fetchPixivR18Images(text);

    if (!images || images.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 'Yah, gw gak nemu gambar R-18 apa-apa nih buat kata kunci itu. Coba yang lain!', m);
    }

    const maxCards = Math.min(images.length, 10); // Batasi maksimal 10 kartu carousel
    const carouselCards = [];

    for (let i = 0; i < maxCards; i++) {
        const image = images[i];

        // Pastikan ada URL gambar yang valid
        if (!image.urls || !image.urls.regular || typeof image.urls.regular !== 'string' || image.urls.regular.trim() === "") {
            console.warn(`Gambar ke-${i + 1} (${image.id}) gak punya URL gambar yang valid, dilewatin.`);
            continue;
        }

        try {
            const imageMedia = await prepareWAMessageMedia({ image: { url: image.urls.regular } }, { upload: conn.waUploadToServer });
            const cardTitle = image.title || `Gambar Pixiv #${i + 1}`;
            const headerTitleText = `Pixiv18: ${text.length > 25 ? text.substring(0, 22) + '...' : text}`;

            carouselCards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `*${cardTitle}*\n*✍️ Penulis:* ${image.author || 'Tidak diketahui'}\n*#️⃣ Tags:* ${image.tags ? image.tags.join(', ') : 'Tidak ada'}`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: `ID Pixiv: ${image.id}`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: headerTitleText,
                    subtitle: image.title || "Hasil Pencarian",
                    hasMediaAttachment: true,
                    ...imageMedia
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"🖼️ Lihat Gambar","url":"${image.urls.regular}"}`
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"✨ Kunjungi Pixiv","url":"${image.url}"}` // Pastikan 'image.url' ini link ke halaman Pixiv aslinya
                        }
                    ]
                })
            });
        } catch (err) {
            console.error(`Gagal memproses gambar Pixiv ke-${i+1} (${image.urls.regular}): `, err);
        }
    }

    if (carouselCards.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: "🤔", key: m.key } });
        return conn.reply(m.chat, 'Waduh, semua gambar dari hasil pencarian Pixiv R-18 kayaknya ada masalah buat ditampilin nih', m);
    }

    const userName = m.pushName || "Masbro"; // Ambil nama pengguna kalau ada, default 'Masbro'

    const carouselMessage = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
                text: `*Sip, ${userName}!* Ini dia hasilnya: *${text}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: "Geser aja buat liat gambar R-18 lainnya! 🔞"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
                title: `🔎 Hasil Pencarian Pixiv R-18: ${text}`,
                hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: carouselCards,
                messageVersion: 1
            })
        })
    }, { userJid: conn.user.id, quoted: m });

    await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key.id });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ["pixiv18 <query>"];
handler.tags = ["nsfw", "premium"]; // Sesuaikan tag
handler.command = /^(pixiv18)$/i; // Command untuk Pixiv18
handler.nsfw = true; // Tandai ini sebagai NSFW
handler.limit = true;
handler.premium = true;

module.exports = handler;
