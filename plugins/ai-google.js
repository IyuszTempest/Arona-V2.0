// hasil gabut pake meta ai, siapa tau ada yg minat 😁🙏

const fetch = require('node-fetch');

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Silakan masukkan pertanyaan Anda';
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`https://fastrestapis.fasturl.cloud/aillm/gpt-4?ask=${encodeURIComponent(text)}&style=Jawab%20dengan%20sangat%20singkat%20namun%20juga%20jelas%20dan%20gunakan%20bahasa%20yang%20ramah`);
    const data = await response.json();

    const speechResponse = await fetch(`https://fastrestapis.fasturl.cloud/tts/google?text=${data.result}&target=id`);
    const audioBuffer = await speechResponse.buffer();
    const anu = "https://files.catbox.moe/poal1t.jpg"
    const audio = {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          mediaUrl: 'www.google.com',
          title: "✨ Google Assistant",
          body: wm,
          sourceUrl: 'www.google.com',
          thumbnail: await (await conn.getFile(anu)).data,
          renderLargerThumbnail: true
        }
      }
    };

    await conn.sendMessage(m.chat, audio, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (error) {
    console.error(error);
    m.reply('Gagal memproses permintaan Anda');
  }
};

handler.help = ['googleai', 'okgoogle'];
handler.tags = ['tools','ai'];
handler.command = /^(googleai|okgoogle)$/i;
handler.limit = true;

module.exports = handler;