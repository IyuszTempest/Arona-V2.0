const fetch = require('node-fetch');

let handler = async (m, { conn, args }) => {
  // Memastikan userId dan zoneId disediakan
  const userId = args[0]; // Ambil userId dari argumen
  const zoneId = args[1]; // Ambil zoneId dari argumen
  if (!userId || !zoneId) {
    return m.reply("Silakan berikan userId dan zoneId untuk MLBB.");
  }

  const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/mlbb?userId=${encodeURIComponent(userId)}&zoneId=${encodeURIComponent(zoneId)}`;

  try {
    // Mengambil data dari API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Memeriksa status respons
    if (data.status === 200) {
      const { username, region } = data.result;

      // Menyusun pesan hasil
      const resultMessage = `
      *Player Information*
      *👤 Username:* ${username}
      *🌍 Region:* ${region}
      `;

      // Mengirimkan informasi pemain
      await conn.sendMessage(m.chat, {
        text: resultMessage
      }, { quoted: m });
    } else {
      m.reply("Terjadi kesalahan: " + data.content);
    }
  } catch (error) {
    console.error(error);
    m.reply("Terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ['mlstalk <userId> <zoneId>'];
handler.tags = ['stalker'];
handler.command = /^mlstalk$/i;

module.exports = handler;