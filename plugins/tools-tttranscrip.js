/*Plugins CJS
Tiktok Transcript
https://whatsapp.com/channel/0029Vb68QKB9xVJjlEm6Un1X
*/

const axios = require('axios');
async function TtTranscript(videoUrl) {
  try {
    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.includes('tiktok.com')) {
        throw new Error('URL TikTok tidak valid atau kosong.');
    }
    const res = await axios.post(
      'https://www.short.ai/self-api/v2/project/get-tiktok-youtube-link',
      { link: videoUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://www.short.ai',
          'Referer': 'https://www.short.ai/tiktok-script-generator',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    const data = res.data?.data?.data;
    if (!data || !data.text) throw new Error('Tidak ada data transkrip ditemukan dari Short.ai.');
    return {
      text: data.text,
      duration: data.duration,
      language: data.language,
      url: res.data?.data?.url,
      segments: data.segments.map(s => ({
        start: s.start,
        end: s.end,
        text: s.text
      }))
    };
  } catch (err) {
    console.error('Error in TtTranscript:', err.message);
    if (err.response && err.response.data) {
        console.error('Short.ai API Response Error:', JSON.stringify(err.response.data));
    }
    throw new Error(`Gagal mengambil transkrip: ${err.message}`);
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
    return conn.reply(m.chat, `Masukkan Link TikToknya, masbro!\nContoh: *${usedPrefix + command}* https://vt.tiktok.com/ZPlayVideo/`, fkontak);
  }
  if (!args[0].includes('tiktok.com') && !args[0].includes('vt.tiktok.com')) {
      return conn.reply(m.chat, 'Link yang kamu berikan bukan link TikTok yang valid, masbro.', fkontak);
  }
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); 
  try {
    const result = await TtTranscript(args[0]);
    if (!result || !result.text) {
        throw new Error('Tidak ada transkrip yang berhasil diambil.');
    }
    let caption = `📝 *Transkrip TikTok Ditemukan!*`;
    caption += `\n*Durasi:* ${result.duration ? `${Math.floor(result.duration / 60)}m ${Math.round(result.duration % 60)}s` : 'N/A'}`;
    caption += `\n*Bahasa:* ${result.language || 'N/A'}`;
    caption += `\n*Link:* ${result.url || args[0]}\n\n`;
    caption += `\`\`\`${result.text.substring(0, 3000)}\`\`\``;
    if (result.text.length > 3000) {
        caption += `\n\n_...transkrip terpotong. Kontak API aslinya untuk versi lengkap._`;
    }
    await conn.reply(m.chat, caption, fkontak);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error('Error di plugin TikTok Transcript:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    conn.reply(m.chat, `❌ Terjadi kesalahan saat mengambil transkrip TikTok: ${e.message}. Coba lagi nanti ya.`, fkontak);
  }
}

handler.help = ['tttranscript <link_tiktok>'];
handler.tags = ['tools'];
handler.command = /^(tttranscript|tiktoktranscript|ttrp)$/i;
handler.limit = true;
handler.premium = false;

module.exports = handler;
