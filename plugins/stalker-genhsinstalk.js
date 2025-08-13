const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  // Memastikan UID disediakan
  const uid = args[0]; // Ambil UID dari argumen
  if (!uid) {
    return m.reply("Silakan berikan UID Genshin Impact.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/genshin/simple?uid=${encodeURIComponent(uid)}`;

  try {
    // Mengambil data dari API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Memeriksa status respons
    if (data.status === 200) {
      const { playerData, screenshotUrl } = data.result;
      const { nickname, level, worldLevel, achievements, spiralAbyss, detailsUrl } = playerData;

      // Menyusun pesan hasil dengan gambar
      const resultMessage = `
      *Player Information*
      *👤 Nickname:* ${nickname}
      *📈 Level:* ${level}
      *🌍 World Level:* ${worldLevel}
      *🏆 Achievements:* ${achievements}
      *🌀 Spiral Abyss:* ${spiralAbyss}
      *🔗 Details URL:* ${detailsUrl}
      `;

      // Mengirimkan informasi pemain dan screenshot dalam satu pesan
      await conn.sendMessage(m.chat, {
        image: { url: screenshotUrl },
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

handler.help = ['genshinstalk <uid>'];
handler.tags = ['stalker'];
handler.command = /^genshin$/i;

module.exports = handler;