const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  // Memastikan URL channel disediakan
  const channelUrl = args[0]; // Ambil URL dari argumen
  if (!channelUrl) {
    return m.reply("Silakan berikan URL channel WhatsApp.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/wachannel?url=${encodeURIComponent(channelUrl)}`;

  try {
    // Mengambil data dari API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Memeriksa status respons
    if (data.status === 200) {
      const { name, followers, description, channelLink, image } = data.result;

      // Menyusun pesan hasil dengan gambar
      const resultMessage = `
      *Channel Information*
      *📺 Name:* ${name}
      *👥 Followers:* ${followers}
      *📝 Description:* ${description}
      *🔗 Channel Link:* ${channelLink}
      `;

      // Mengirimkan informasi channel dan gambar dalam satu pesan
      await conn.sendMessage(m.chat, {
        image: { url: image },
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

handler.help = ['wachstalk<url>'];
handler.tags = ['stalker'];
handler.command = /^wachstalk$/i;

module.exports = handler;