const fetch = require('node-fetch'); // Menggunakan require untuk CommonJS
const { proto, generateWAMessageContent, generateWAMessageFromContent } = require("@adiwajshing/baileys"); // Menggunakan require untuk Baileys

let handler = async (m, { conn, usedPrefix, command }) => { // Tambahkan usedPrefix
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

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    const jumlahGambar = 8;
    let pickedImages = [];

    // Menggunakan Promise.all untuk mengambil gambar secara paralel
    const fetchPromises = [];
    for (let i = 0; i < jumlahGambar; i++) {
        fetchPromises.push(
            (async () => {
                try {
                    let res = await fetch('https://api.siputzx.my.id/api/r/blue-archive');
                    if (!res.ok) throw new Error(`API response not OK: ${res.status}`);
                    let buffer = await res.buffer();
                    if (!buffer || buffer.length === 0) throw new Error('Empty buffer received.');
                    return { buffer, directLink: 'https://bluearchive.jp' }; // static link
                } catch (fetchErr) {
                    console.error(`Error fetching image ${i+1}:`, fetchErr.message);
                    return null; // Return null if fetch fails for one image
                }
            })()
        );
    }
    pickedImages = (await Promise.all(fetchPromises)).filter(item => item !== null); // Filter out failed fetches

    if (pickedImages.length === 0) {
        throw new Error('Gagal memuat gambar waifu dari API. Coba lagi nanti.');
    }

    const carouselCards = await Promise.all(pickedImages.map(async (item, index) => {
      try {
        // prepareWAMessageMedia is needed for imageMessage in header
        const imageMedia = await generateWAMessageContent({ image: item.buffer }, { upload: conn.waUploadToServer });
        
        return {
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `🖼️ ᴡᴀɪғᴜ ʀᴀɴᴅᴏᴍ ᴋᴇ - ${index + 1}`
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: "🔹 ɢᴇsᴇʀ ᴜɴᴛᴜᴋ ʟɪʜᴀᴛ ʟᴀɪɴɴʏᴀ"
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `🎀 ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ${index + 1}`,
            hasMediaAttachment: true,
            imageMessage: imageMedia.imageMessage // Ambil imageMessage dari hasil generateWAMessageContent
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: `{"display_text":"🌐 ʙᴜᴋᴀ sɪᴛᴜs", "url": "${item.directLink}"}`
              }
            ]
          })
        };
      } catch (cardErr) {
        console.error(`Error creating carousel card for image ${index+1}:`, cardErr);
        return null; // Return null if card creation fails
      }
    }));
    
    const validCarouselCards = carouselCards.filter(card => card !== null); // Filter out failed cards

    if (validCarouselCards.length === 0) {
        throw new Error('Semua gambar gagal diproses untuk tampilan carousel.');
    }

    const carouselMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: { // Pastikan ini dikirim sebagai ViewOnceMessage
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🎀 ᴡᴀɪғᴜ ʀᴀɴᴅᴏᴍ ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `📂 Gambar Ke: ${validCarouselCards.length}` // Gunakan jumlah kartu yang valid
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: `✨ Random Waifu - Blue Archive`,
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: validCarouselCards, // Menggunakan kartu yang valid saja
              messageVersion: 1
            })
          })
        }
      }
    }, {
      quoted: fkontak // Pakai fkontak
    });

    await conn.relayMessage(m.chat, carouselMessage.message, {
      messageId: carouselMessage.key.id
    });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

  } catch (err) {
    console.error('Blue Archive random image error:', err);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
    conn.reply(m.chat, `❌ Gagal memuat waifu: ${err.message || 'Tidak diketahui'}.`, fkontak); // Pakai fkontak
  }
};

handler.help = ['bluearchive'];
handler.tags = ['anime'];
handler.command = /^(bluearchive)$/i; // Tambah alias 'ba'
handler.limit = true;
handler.premium = false;

module.exports = handler;
