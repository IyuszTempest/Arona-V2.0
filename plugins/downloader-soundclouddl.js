const axios = require('axios');

const fetchSoundCloudAudio = async (url) => {
  try {
    const response = await axios.get(`https://apii-kurumi.biz.id/api/scdl?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching SoundCloud audio:', error.message);
    return null;
  }
};

const handler = async (m, { text, conn }) => {
  if (!text) {
    return m.reply('Woi, masukin link SoundCloud-nya dong!');
  }

  const data = await fetchSoundCloudAudio(text);
  if (data) {
    if (data.status) {
      const result = data.result;

      // Kirim audio via PTT (Push-to-Talk)
      await conn.sendMessage(m.chat, {
        audio: { url: result.download },
        caption: `*Judul:* ${result.title}\n*Durasi:* ${result.duration}\n*Kualitas:* ${result.quality}`,
        mimetype: 'audio/mpeg',
        ptt: true // Aktifin PTT!
      }, { quoted: m });
    } else {
      m.reply('Hmm, kayaknya gak ketemu atau datanya error nih...');
    }
  } else {
    m.reply('Aduh, servernya lagi ngambek kayaknya. Coba lagi ya nanti!');
  }
};

handler.help = ['scdl <url>'];
handler.tags = ['downloader'];
handler.command = /^scdl/i;
handler.limit = 2;

module.exports = handler;