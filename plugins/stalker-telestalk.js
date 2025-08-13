const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  // Memastikan username disediakan
  const username = args[0]; // Ambil username dari argumen
  if (!username) {
    return m.reply("Silakan berikan username Telegram.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/telegram?username=${encodeURIComponent(username)}`;

  try {
    // Mengambil data dari API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Memeriksa status respons
    if (data.status === 200) {
      const { title, desc, imageUrl } = data.result;

      // Menyusun pesan hasil dengan gambar
      const resultMessage = `
      *User  Information*
      *👤 Username:* ${title}
      *📝 Description:* ${desc}
      *🖼️ Image:* ${imageUrl}
      `;

      // Mengirimkan informasi pengguna dan gambar dalam satu pesan
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: resultMessage
      }, { quoted: m });
    } else {
      m.reply("Terjadi kesalahan: " + data.content);
    }
  } catch (error) {
    console.error(error);
    m.reply("Terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ['telestalk <username>'];
handler.tags = ['stalker'];
handler.command = /^telestalk$/i;

module.exports = handler;