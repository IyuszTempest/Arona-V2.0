const fetch = require('node-fetch');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@adiwajshing/baileys");
const axios = require('axios'); // Pastikan axios sudah di-require

// Ganti API ke yang baru
const PINTEREST_API_URL = 'https://api.privatezia.biz.id/api/search/pinterestsearch';

const fetchImages = async (query) => {
  const apiUrl = `${PINTEREST_API_URL}?query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(apiUrl); // Menggunakan node-fetch untuk API ini
    const jsonData = await response.json();
    
    if (jsonData.status && jsonData.results && jsonData.results.length > 0) { // Cek 'results' bukan 'data'
      return jsonData.results; // Mengembalikan array 'results'
    } else {
      console.error("API request failed or returned unexpected data:", jsonData);
      return [];
    }
  } catch (error) {
    console.error("Error fetching Pinterest data from new API:", error);
    return [];
  }
};

let handler = async (m, { conn, command, text, usedPrefix }) => { 
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

    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    if (!text) {
        return conn.reply(m.chat, `Masukin dulu kata kuncinya dong, masbro. Contoh: *${usedPrefix + command} kucing oren*`, fkontak); 
    }

    const images = await fetchImages(text);

    if (!images || images.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return conn.reply(m.chat, 'Yah, gw gak nemu apa-apa nih buat kata kunci itu. Coba yang lain!', fkontak); 
    }

    const maxCards = Math.min(images.length, 10);
    const carouselCards = [];

    for (let i = 0; i < maxCards; i++) {
        const image = images[i];

        // API baru punya `media.images.orig.url` untuk gambar asli berkualitas tinggi
        const imageUrlToDownload = image.media?.images?.orig?.url; 
        
        if (!imageUrlToDownload || typeof imageUrlToDownload !== 'string' || imageUrlToDownload.trim() === "") {
            console.warn(`Gambar ke-${i + 1} (${image.id}) dari API baru gak punya URL gambar valid di 'media.images.orig.url', dilewatin.`);
            continue;
        }

        try {
            // --- PERBAIKAN DI SINI: Tambahkan headers LENGKAP ke axios.get untuk download gambar ---
            const imageBuffer = (await axios.get(imageUrlToDownload, { 
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': image.pin_url || 'https://www.pinterest.com/', // Referer harus spesifik ke halaman Pin aslinya jika ada
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                    'Connection': 'keep-alive',
                    'DNT': '1', // Do Not Track
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache',
                }
            })).data;
            // --- AKHIR PERBAIKAN ---

            const imageMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });
            const cardTitle = image.title || `Gambar Pinterest #${i + 1}`;
            const headerTitleText = `Pinterest: ${text.length > 25 ? text.substring(0, 22) + '...' : text}`;

            carouselCards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `*${cardTitle}*\n\n${image.created_at ? `Dibuat: ${image.created_at}` : ''}\nUploader: ${image.uploader?.full_name || '-'}`
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                    text: `ID Pin: ${image.id}`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: headerTitleText,
                    subtitle: image.description || "Hasil Pencarian", // Gunakan description sebagai subtitle
                    hasMediaAttachment: true,
                    imageMessage: imageMedia.imageMessage 
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"🖼️ Lihat Gambar","url":"${imageUrlToDownload}"}` // Link ke gambar asli
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"📌 Kunjungi Pin","url":"${image.pin_url}"}` // Link ke halaman Pin
                        }
                    ]
                })
            });
        } catch (err) {
            console.error(`Gagal memproses gambar ke-${i+1} (${imageUrlToDownload}): `, err);
            if (err.response) {
                console.error(`  Status: ${err.response.status}, Headers: ${JSON.stringify(err.response.headers)}, Data: ${err.response.data.toString()}`);
            } else if (err.code) { 
                 console.error(`  Kode Error: ${err.code}, Pesan: ${err.message}`);
            }
        }
    }

    if (carouselCards.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: "🤔", key: m.key } });
        return conn.reply(m.chat, 'Waduh, semua gambar dari hasil pencarian kayaknya ada masalah buat ditampilin nih. Pastikan kata kunci dan link gambar valid.', fkontak); 
    }

    const userName = m.pushName || "Masbro";

    const carouselMessage = generateWAMessageFromContent(m.chat, {
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
                text: `*Sip, ${userName}!* Ini dia hasilnya: *${text}*`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: "Geser aja buat liat yang lain! 😎"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
                title: `🔎 Hasil Pencarian: ${text}`,
                hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: carouselCards,
                messageVersion: 1
            })
        })
    }, { userJid: conn.user.id, quoted: fkontak });

    await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key.id });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ["pin <query>", "pinterest <query>"];
handler.tags = ["internet", "tools", "image"];
handler.command = /^(pin|pinterest)$/i;
handler.limit = true;

module.exports = handler;