// Plugins tete search
// Sumber: https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C

const axios = require('axios');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@adiwajshing/baileys');

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) throw (`EX: ${usedPrefix + command} saa senpai~`);
  try {
    await m.reply(wait);

    let { title, no_watermark } = await tiktoks(text);

    const noBeton = false; // Ubah ke false jika ingin menggunakan beton

    const message = {
      video: { url: no_watermark },
      caption: `Permintaan oleh ${m.pushName} `,
      footer: 'Ditenagai oleh Arona Bot Multidevice',
      ...(noBeton
        ? { mimetype: 'video/mp4' }
        : {
            buttons: [
              {
                buttonId: `.ttsearch ${text}`,
                buttonText: { displayText: 'Berikutnya' },
                type: 1
              }
            ],
            headerType: 5,
            viewOnce: true
          }
      )
    };

    return await conn.sendMessage(m.chat, message, { quoted: m });

  } catch (e) {
    console.error(e);
  }
};

handler.help = ["tiktoksearch"];
handler.tags = ["downloader","premium"];
handler.command = /^(ttsearch|tiktoksearch)$/i;
handler.limit = 2;
handler.register = true;
handler.premium = true;

module.exports = handler;

async function tiktoks(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1
        }
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee];

        const result = {
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}