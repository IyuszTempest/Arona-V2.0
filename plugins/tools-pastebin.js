/*
convert by Arona AI (Gemini)
ch: https://whatsapp.com/channel/0029VaUAQxUHwXb4O5mN610c
source: https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N/1107
*/
const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => { // Tambahin usedPrefix dan command
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

  if (!text) {
    return conn.reply(m.chat, `*Format salah.* Contoh: *${usedPrefix + command}* https://pastebin.com/xxxxxxxx`, fkontak); // Pakai fkontak
  }

  // Validasi URL Pastebin
  if (!text.match(/(https:\/\/)?(www\.)?pastebin\.com\/(raw\/)?[a-zA-Z0-9]{8}/)) {
      return conn.reply(m.chat, 'Link yang kamu berikan bukan link Pastebin yang valid, masbro. Pastikan formatnya benar.', fkontak); // Pakai fkontak
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // Reaksi menunggu

  try {
    const apiUrl = `https://fastrestapis.fasturl.cloud/downup/pastebindown?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data || data.status !== 200 || !data.result || !data.result.content) {
      // Lebih spesifik jika ada pesan error dari API
      const errorMessage = data.content || 'Data tidak lengkap dari API.';
      return conn.reply(m.chat, `Gagal mengambil code nya nih: ${errorMessage}\nPastikan link bener ama link pastebin nya ga private.`, fkontak); // Pakai fkontak
    }

    const { title, language, rawLink, downloadLink, content, datePosted, username, viewCount } = data.result;

    const pastebinContent = content.trim();
    if (!pastebinContent) {
      return conn.reply(m.chat, 'Data Pastebin kosong.', fkontak); // Pakai fkontak
    }

    let caption = `📋 *Isi Pastebin:*\n\n`;
    caption += `*Judul:* ${title || '-'}\n`;
    caption += `*Bahasa:* ${language || '-'}\n`;
    caption += `*Diposting:* ${datePosted || '-'}\n`;
    caption += `*Oleh:* ${username || '-'}\n`;
    caption += `*Dilihat:* ${viewCount || '-'} kali\n`;
    caption += `*Link Mentah:* ${rawLink || '-'}\n`;
    caption += `*Link Download:* ${downloadLink || '-'}\n\n`;
    caption += `\`\`\`${pastebinContent.substring(0, 2000)}\`\`\`\n`; // Batasi panjang content untuk menghindari pesan terlalu panjang

    if (pastebinContent.length > 2000) {
        caption += `_...konten terpotong. Untuk melihat lengkap, kunjungi link mentah di atas._`;
    }

    await conn.reply(m.chat, caption, fkontak); // Pakai fkontak
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // Reaksi sukses

  } catch (error) {
    console.error("Error di plugin Pastebin:", error);
    // Lebih spesifik jika error dari response Axios
    if (error.response && error.response.data) {
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil data: API Error (${error.response.status}) - ${error.response.data.message || error.response.data.content}`, fkontak);
    } else {
        await conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil data: ${error.message || 'Koneksi terputus.'}`, fkontak);
    }
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }); // Reaksi gagal
  }
};

handler.help = ['pastebin <url>'];
handler.tags = ['tools'];
handler.command = ['pastebin'];
handler.limit = true; // Tambahkan limit

module.exports = handler;