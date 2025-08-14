/*
* Nama fitur : Threads Downloader [Support image]
* Type : Plugin CJS
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzzXD (CJS Mod by Alfatsyah)
*/

const axios = require('axios');

let handler = async (m, { args, conn }) => {
  if (!args[0]) return m.reply('mana url nya bg?, contoh, .threadsdl3 <url>');

  // Daftar emoji proses random
  const prosesEmoji = [
    '⏳', '⌛', '🔄', '🔃', '🌀', '♻️', '🔁', '⚙️', '🛠️', '📥'
  ];
  let emojiRandom = prosesEmoji[Math.floor(Math.random() * prosesEmoji.length)];
  m.reply(`${emojiRandom} Sedang memproses...`);

  let url = args[0];

  try {
    let res = await axios.get('https://api.threadsphotodownloader.com/v2/media', {
      params: { url },
      headers: {
        'authority': 'api.threadsphotodownloader.com',
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'origin': 'https://sssthreads.pro',
        'referer': 'https://sssthreads.pro/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
      }
    });

    let data = res.data;

    if (data.video_urls && data.video_urls.length > 0) {
      for (let vid of data.video_urls) {
        await conn.sendFile(m.chat, vid.download_url, '_zennvid.mp4', '', m);
      }
    } else if (data.image_urls && data.image_urls.length > 0) {
      for (let img of data.image_urls) {
        await conn.sendFile(m.chat, img, '_zennimg.jpg', '', m);
      }
    } else {
      m.reply('media gak ditemukan, coba lagi nanti');
    }
  } catch (err) {
    m.reply(`Eror kak : ${err.message}`);
  }
};

handler.command = ['threads'];
handler.help = ['threads <url>'];
handler.tags = ['downloader'];

module.exports = handler;
