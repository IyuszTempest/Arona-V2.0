const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) throw '🔍 Masukkan nama karakter cosplay yang ingin dicari!';

  await conn.reply(m.chat, 'Mencari informasi cosplay...', m);

  try {
    // Construct the API URL
    const apiUrl = `https://fastrestapis.fasturl.cloud/sfwnsfw/cosplaytele?query=${encodeURIComponent(text.trim())}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) throw `❌ Gagal mengambil data dari API! Status: ${response.status}`;

    const result = await response.json();
    
    // Check if the result is successful
    if (result.status !== 200 || !result.result || result.result.length === 0) {
      throw '❌ Tidak ada cosplay yang ditemukan untuk kata kunci ini.';
    }

    // Shuffle the results and select the first five
    const shuffledResults = result.result.sort(() => 0.5 - Math.random());
    const selectedCosplays = shuffledResults.slice(0, 5);

    // Construct and send messages for each selected cosplay
    for (const cosplay of selectedCosplays) {
      let message = `*♥️ Cosplayer:* [${cosplay.title}](${cosplay.link})\n` +
                    `*📝 Deskripsi:* ${cosplay.description}\n` +
                    `*✨ Link:* [Lihat lebih lanjut](${cosplay.link})`;

      // Send the image as a media attachment
      await conn.sendMessage(m.chat, { image: { url: cosplay.image }, caption: message }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message || 'Gagal mengambil data.'}` }, { quoted: m });
  }
};

// Command and help information
handler.help = ['cosplaytele <keyword>'];
handler.tags = ['nsfw','premium'];
handler.nsfw = true;
handler.command = /^(cosplaytele)$/i;

handler.register = true;
handler.premium = true;

module.exports = handler;