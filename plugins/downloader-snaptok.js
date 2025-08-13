/**
══ ✨ 「 *Yeonelle ID* 」 ✨ ══
 @ *Name:* Plugins CJS Snaptok ( TikTok Downloader )
 @ *Author:* Yeonelle
 @ *Source Code:* https://whatsapp.com/channel/0029VbBDTFd6mYPDtnetTK1f
 @ *Source Scrape:* https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3483
═══════════════
**/

const axios = require('axios');
const cheerio = require('cheerio'); // CJS tidak butuh '* as'

async function SnapTok(tiktokUrl) {
  if (!/^https:\/\/(vt|www)\.tiktok\.com/.test(tiktokUrl)) {
    return { error: '❌ Link TikTok tidak valid, senpai!' };
  }

  try {
    const res = await axios.post('https://snap-tok.com/api/download',  {
      id: tiktokUrl,
      locale: 'id'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://snap-tok.com', 
        'Referer': 'https://snap-tok.com/tiktok-downloader' 
      }
    });

    const $ = cheerio.load(res.data);

    const videoUrl = $('a[href*="tikcdn.io"]').first().attr('href');
    const username = $('h2').first().text().trim() || 'Tidak diketahui';
    const caption = $('p.maintext, div.text-gray-500').first().text().trim() || 'Tanpa deskripsi';

    if (!videoUrl) {
      return { error: '❌ Video tidak ditemukan, mungkin private atau SnapTok sedang error, senpai 😢' };
    }

    return {
      username,
      caption,
      videoUrl
    };

  } catch (err) {
    console.error('Hmm, error senpai:(', err.message);
    return { error: '❌ Gagal mengambil data dari SnapTok, senpai! 😓' };
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => { // Ganti 'yeon' jadi 'handler' untuk konsistensi plugin
  if (!text) {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `📱 *Senpai*, masukkan URL video TikTok yang ingin diunduh!  
Contoh: *${usedPrefix + command}* https://vt.tiktok.com/ZSkXevLFH` 
    });
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    const result = await SnapTok(text);

    if (result.error) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: result.error
      });
    }

    const { username, caption, videoUrl } = result;

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `✨ *Video berhasil diunduh, Senpai!* 📌 *Username:* ${username}  
📝 *Caption:* ${caption}`
    });

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (e) {
    console.error('Error:', e.message);
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
    await conn.sendMessage(m.chat, {
      text: `⚠️ *Ups, terjadi kesalahan, Senpai!* Fitur ini sedang gangguan, coba lagi nanti ya 😅`
    });
  }
};

handler.help = ['snaptok <url>'];
handler.tags = ['downloader','premium'];
handler.command = /^snaptok$/i;
handler.register = true;
handler.limit = true;
handler.premium = true;

module.exports = handler; // Ubah export default jadi module.exports
