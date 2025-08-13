let fetch = require('node-fetch');

let handler = async (m, { text, usedPrefix, command, conn }) => {
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
    return conn.reply(m.chat, `Contoh:\n*${usedPrefix + command}* <h1>Halo Dunia</h1>\n\n*Catatan:* Hanya kode HTML murni, bukan URL.`, fkontak); // Pakai fkontak
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } }); // Reaksi menunggu

  try {
    let response = await fetch('https://img-gen.uibun.dev/api/htmltoimg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', // User-Agent yang lebih umum
        'Referer': 'https://www.uibun.dev/htmltopng'
      },
      body: JSON.stringify({ html: text })
    });

    if (!response.ok) {
      const errorText = await response.text(); // Coba ambil teks error dari response
      throw new Error(`Gagal mengubah HTML ke gambar! Status: ${response.status}. Pesan: ${errorText.substring(0, 100) || 'Tidak diketahui'}`);
    }

    let buffer = await response.buffer();

    if (!buffer || buffer.length === 0) {
        throw new Error('Tidak ada gambar yang diterima dari API.');
    }

    await conn.sendMessage(m.chat, { image: buffer, caption: "✅ Done!" }, { quoted: fkontak }); // Pakai fkontak
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } }); // Reaksi sukses

  } catch (e) {
    console.error('Error di plugin HTML2Img:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }); // Reaksi gagal
    await conn.reply(m.chat, `❌ Terjadi kesalahan saat mengubah HTML ke gambar: ${e.message}. Pastikan kode HTML valid dan tidak terlalu kompleks.`, fkontak); // Pakai fkontak
  }
};

handler.help = ['html2img <kode HTML>'];
handler.tags = ['tools', 'image']; // Tambah tag 'image'
handler.command = /^html2img$/i;
handler.limit = true; // Bisa pakai limit

module.exports = handler;