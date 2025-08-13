/*Plugins CJS
Bilibili Downloader
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
const qs = require('qs');

async function bilibiliDown(urls) {
  function getBilibiliId(url) {
    const match = url.match(/\/video\/(BV[0-9a-zA-Z]+)/);
    return match ? match[1] : null;
  }
  const videoId = getBilibiliId(urls);
  if (!videoId) throw new Error('ID Bilibili tidak ditemukan dari URL.');
  const url = 'https://bilibili-video-downloader.com/wp-admin/admin-ajax.php';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Accept': '*/*',
    'Referer': 'https://bilibili-video-downloader.com/id/',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': 'night=0;pll_language=id;_ga=GA1.1.1960969487.1753569405;_ga_2M82ZRZFVW=GS2.1.s1753569404$o1$g0$t1753569407$j57$l0$h0',
    'x-requested-with': 'XMLHttpRequest',
  };
  const data = qs.stringify({
    nonce: 'e5a666b33e', // SANGAT RENTAN BERUBAH
    action: 'get_bilibili_tv_video',
    aid: videoId
  });
  try {
    const response = await axios.post(url, data, { headers });
    if (!response.data || !response.data.success || !response.data.data || !response.data.data.video_url) {
        throw new Error(response.data.message || 'Tidak ada URL video yang ditemukan dari respons.');
    }
    return response.data;
  } catch (error) {
    console.error('Error in bilibiliDown scraper:', error.message);
    if (error.response && error.response.data) {
        console.error('Bilibili Downloader API Response Error:', JSON.stringify(error.response.data));
    }
    throw new Error(`Gagal mengunduh dari Bilibili: ${error.message}`);
  }
}
let handler = async (m, { conn, args, usedPrefix, command }) => {
  const fkontak = {
      key: {
          participants: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
          fromMe: false,
          id: "Halo"
      },
      message: {
          contactMessage: {
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
      },
      participant: "0@s.whatsapp.net"
  };
  if (!args[0]) {
    return conn.reply(m.chat, `Masukkan URL Bilibili!\nContoh: *${usedPrefix + command}* https://www.bilibili.com/video/BV1cy4y1k7A2/`, fkontak);
  }
  if (!args[0].match(/bilibili\.com\/video\/|b23\.tv/i)) {
      return conn.reply(m.chat, 'Link yang kamu berikan bukan link Bilibili yang valid, masbro.', fkontak);
  }
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); 
  try {
    const result = await bilibiliDown(args[0]);
    
    const videoUrl = result.data.video_url;
    const videoId = args[0].match(/\/video\/(BV[0-9a-zA-Z]+)/)?.[1] || 'video';
    if (!videoUrl) throw new Error('Tidak ada link video yang ditemukan setelah diunduh.');
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `bilibili_${videoId}.mp4`,
      caption: `✅ *Bilibili Video Ditemukan!*`
    }, { quoted: fkontak });
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    
  } catch (e) {
    console.error('Error di plugin Bilibili Downloader:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    conn.reply(m.chat, `❌ Terjadi kesalahan saat mendownload Bilibili: ${e.message}. Coba lagi nanti ya.`, fkontak);
  }
}

handler.help = ['bilibili <url>'];
handler.command = ['bilibili', 'bilibilidl'];
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

module.exports = handler;
