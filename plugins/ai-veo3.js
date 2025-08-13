/* plugins  veo3
  type cjs
   code  by ZIA ULHAQ
   *SUMBER*
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/


const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} Make a video of a girl talking to a tiger`);

  await conn.sendMessage(m.chat, {
    react: {
      text: '⏳',
      key: m.key
    }
  });

  try {
    const { data } = await axios.get(`https://api.privatezia.biz.id/api/ai/veo3`, {
      params: { prompt: text }
    });

    if (!data.status || !data.result?.data?.video_url) {
      return m.reply('❌ Gagal membuat video. Coba lagi nanti.');
    }

    const videoUrl = data.result.data.video_url;
    const thumbUrl = data.result.data.image_url;

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });

    await conn.sendFile(
      m.chat,
      videoUrl,
      'veo.mp4',
      `✅ *Berhasil dibuat!*\n\n📜 *Prompt:* ${text}`,
      m,
      {
        thumbnail: await (await axios.get(thumbUrl, { responseType: 'arraybuffer' })).data
      }
    );

  } catch (e) {
    console.error(e);
    m.reply('❌ Terjadi kesalahan. Coba lagi nanti.');
  }
};

handler.help = ['veo3 <prompt>'];
handler.tags = ['ai', 'premium'];
handler.command = /^veo3$/i;
handler.premium = true;
handler.register = true;

module.exports = handler;