/* plugins  suno
  type cjs
   code prompt ai by ZIA ULHAQ  
   *SUMBER*
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X 
*/
   


const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} lagu tentang rasa cintaku kepada dia`);

  let quotedStatus = {
    key: {
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'ZIA-STATUS',
      participant: '0@s.whatsapp.net'
    },
    message: {
      conversation: 'kontak'
    }
  };

  await conn.sendMessage(m.chat, {
    text: 'wait',
    contextInfo: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    }
  }, { quoted: quotedStatus });

  try {
    let res = await axios.get(`https://api.privatezia.biz.id/api/ai/suno?query=${encodeURIComponent(text)}`);
    let json = res.data;

    if (!json.status || !json.result || !json.result.data || !json.result.data.length) {
      return m.reply('❌ Gagal membuat lagu. Coba lagi nanti.');
    }

    let data = json.result.data[0];
    let audio = data.audio_url;
    let img = data.image_url;
    let title = data.title;
    let prompt = data.prompt;

    let caption = `🎵 *Judul:* ${title}\n📝 *Prompt:*\n${prompt}`;

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Lagu AI oleh Suno via @ZiaUlhaq',
          thumbnailUrl: img,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: audio
        }
      }
    }, { quoted: quotedStatus });

    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: quotedStatus });

    await conn.sendMessage(m.chat, {
      document: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: 'Versi dokumen untuk disimpan dengan judul lengkap'
    }, { quoted: quotedStatus });

  } catch (err) {
    console.error(err);
    m.reply('❌ Terjadi kesalahan saat membuat lagu.');
  }
};

handler.command = /^suno$/i;
handler.help = ['suno <query>'];
handler.tags = ['ai'];

module.exports = handler;